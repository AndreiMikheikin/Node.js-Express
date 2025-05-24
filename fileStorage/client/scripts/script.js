const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const commentInput = document.getElementById('comment');
const progressBar = document.getElementById('progressBar');
const cancelBtn = document.getElementById('cancelBtn');
const statusText = document.getElementById('statusText');
const progressContainer = document.getElementById('progressContainer');
const filesList = document.getElementById('filesList');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

if (!crypto.randomUUID) {
    crypto.randomUUID = function () {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);

        // Преобразование в UUIDv4 строку
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        const toHex = (b) => b.toString(16).padStart(2, '0');
        const hex = Array.from(bytes, toHex).join('');

        return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20)}`;
    };
}

let ws = null;
let uploadId = null;
let controller = null;
let currentFilename = null;

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (ws) {
        try { ws.close(); } catch {}
        ws = null;
    }

    currentFilename = file.name;
    commentInput.value = '';
    hideProgressUI();
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    uploadBtn.disabled = false;
});

uploadBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) return showError('Выберите файл');
    if (uploadId) return showError('Загрузка уже идёт');
    startUpload(file);
});

cancelBtn.addEventListener('click', cancelUpload);

function startUpload(file) {
    uploadId = crypto.randomUUID();
    controller = new AbortController();
    showProgressUI();
    uploadBtn.disabled = true;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${wsProtocol}//${window.location.hostname}:3335`);

    const wsTimeout = setTimeout(() => {
        if (ws && ws.readyState !== WebSocket.OPEN) {
            ws.close();
            showError('Не удалось установить соединение');
            resetUpload();
        }
    }, 5000);

    ws.addEventListener('open', () => {
        clearTimeout(wsTimeout);
        ws.send(JSON.stringify({ type: 'bind', uploadId }));
        uploadFile(file);
    });

    ws.addEventListener('message', (e) => {
        const data = JSON.parse(e.data);
        if (data.uploadId !== uploadId) return;

        switch (data.type) {
            case 'progress':
                updateProgress(data);
                break;
            case 'done':
                completeUpload();
                break;
            case 'aborted':
                markAsAborted(data.uploadId);
                showError('Загрузка прервана');
                break;
        }
    });

    ws.addEventListener('close', () => {
        if (progressBar.value < 100) showError('Соединение прервано');
    });

    ws.addEventListener('error', () => {
        showError('Ошибка соединения с сервером');
    });
}

function uploadFile(file) {
    fetch('/upload', {
        method: 'POST',
        signal: controller.signal,
        headers: {
            'x-upload-id': uploadId,
            'x-filename': encodeURIComponent(file.name),
            'x-filesize': file.size,
            'x-comment': encodeURIComponent(commentInput.value || '')
        },
        body: file
    })
    .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки');
        // Сервер отправит done при успешном завершении
    })
    .catch(err => {
        if (err.name === 'AbortError') {
            // Обработка уже происходит в cancelUpload
        } else {
            console.error('[Client] Ошибка загрузки:', err);
            showError('Ошибка при загрузке файла');
        }
    });
}

function cancelUpload() {
    if (controller) controller.abort();

    if (ws && uploadId) {
        try {
            ws.send(JSON.stringify({ type: 'aborted', uploadId }));
        } catch (e) {
            console.warn('[Client] Ошибка отправки прерывания:', e);
        }
    }

    showError('Загрузка прервана');
    resetUpload(true); // Не закрываем ws до получения от сервера
}

function updateProgress(data) {
    progressBar.value = data.progress;
    statusText.innerText = `Загружено ${formatBytes(data.received)} из ${formatBytes(data.total)} (${data.progress}%)`;
}

function completeUpload() {
    successMessage.innerText = 'Файл успешно загружен!';
    successMessage.style.display = 'block';
    errorMessage.innerText = '';
    controller = null;
    uploadId = null;
    if (ws) {
        try { ws.close(); } catch {}
        ws = null;
    }
    fileInput.value = '';
    commentInput.value = '';
    currentFilename = null;
    uploadBtn.disabled = false;
    hideProgressUI();
    loadFiles();
}

function markAsAborted(id) {
    if (uploadId === id) {
        resetUpload();
    }
}

function resetUpload(keepWS = false) {
    if (!keepWS && ws) {
        try { ws.close(); } catch {}
        ws = null;
    }
    controller = null;
    uploadId = null;
    currentFilename = null;
    fileInput.value = '';
    uploadBtn.disabled = false;
    hideProgressUI();
}

function showProgressUI() {
    progressContainer.style.display = 'block';
    cancelBtn.style.display = 'inline-block';
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    successMessage.innerText = '';
    errorMessage.innerText = '';
    progressBar.value = 0;
    statusText.innerText = 'Загрузка...';
}

function hideProgressUI() {
    progressContainer.style.display = 'none';
    cancelBtn.style.display = 'none';
}

function showError(message) {
    errorMessage.innerText = message;
    errorMessage.style.display = 'block';
    hideProgressUI();
    uploadBtn.disabled = false;
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / 1024 / 1024).toFixed(1) + ' МБ';
}

function loadFiles() {
    fetch('/files')
        .then(res => res.json())
        .then(files => {
            if (!Array.isArray(files)) return;
            filesList.innerHTML = '';
            files.forEach(file => {
                const div = document.createElement('div');
                div.className = 'aam_file-item';
                const icon = file.name.match(/\.(jpg|png|gif|jpeg|webp)$/i)
                    ? `<img src="${file.url}" class="aam_file-preview" />`
                    : '<span class="aam_file-icon">📄</span>';
                div.innerHTML = `
                    ${icon}
                    <div class="aam_file-info">
                        <a href="${file.url}" download>${decodeURIComponent(file.name)}</a>
                        <span>${formatBytes(file.size)}</span>
                        ${file.comment ? `<div class="aam_file-comment">💬 ${file.comment}</div>` : ''}
                    </div>
                `;
                filesList.appendChild(div);
            });
        })
        .catch(err => console.error('Ошибка загрузки списка файлов:', err));
}

document.addEventListener('DOMContentLoaded', loadFiles);