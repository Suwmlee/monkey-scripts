// ==UserScript==
// @name         BTN HR Inactive Torrent
// @namespace    https://github.com/Suwmlee/monkey-scripts
// @version      0.2
// @description  download BTN HR and Inactive torrents 
// @author       suwmlee
// @match        https://broadcasthe.net/snatchlist.php*&hnr=1
// @match        https://broadcasthe.net/snatchlist.php?id=*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // 添加样式
    GM_addStyle(`
        #customContainer {
            position: fixed;
            width: 300px;
            bottom: 20px;
            right: 20px;
            background-color: #f9f9f9;
            padding: 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }
        .input-group {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .input-group label {
            margin-right: 5px;
            width:80px;
            color: black;
            font-size: 14px;
            white-space: nowrap;
        }
        .input-group input {
            flex-grow: 1;
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        #copyLinksButton {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px;
            width: 100%;
            cursor: pointer;
            border-radius: 5px;
        }
        #copyLinksButton:hover {
            background-color: #45a049;
        }
    `);

    // 创建容器
    const container = document.createElement('div');
    container.id = 'customContainer';
    container.innerHTML = `
        <div class="input-group">
            <label for="authkey">authkey:</label>
            <input type="text" id="authkey" placeholder="authkey" />
        </div>
        <div class="input-group">
            <label for="torrentPass">torrent_pass:</label>
            <input type="text" id="torrentPass" placeholder="torrent_pass" />
        </div>
        <button id="copyLinksButton">复制下载链接</button>
    `;
    document.body.appendChild(container);

    // 初始化输入框值（从 localStorage 读取）
    const authkeyInput = document.getElementById('authkey');
    const torrentPassInput = document.getElementById('torrentPass');
    authkeyInput.value = localStorage.getItem('authkey') || '';
    torrentPassInput.value = localStorage.getItem('torrentPass') || '';

    // 保存输入框值到 localStorage
    authkeyInput.addEventListener('input', () => {
        localStorage.setItem('authkey', authkeyInput.value);
    });
    torrentPassInput.addEventListener('input', () => {
        localStorage.setItem('torrentPass', torrentPassInput.value);
    });

    // 按钮点击事件
    document.getElementById('copyLinksButton').addEventListener('click', () => {
        const authkey = authkeyInput.value.trim();
        const torrentPass = torrentPassInput.value.trim();
        let downloadUrlsText = '';

        if (location.href.include("hnr=1")) {
            // 获取所有的 <a> 元素
            const allLinks = document.querySelectorAll('a');
            downloadUrlsText = Array.from(allLinks)
                .filter(link => link.href.includes('action=download'))
                .map(link => link.href + "&authkey=" + authkey + "&torrent_pass=" + torrentPass) // 获取每个链接的 href 属性
                .join('\n'); // 用换行符分隔链接
        } else {
            const tableRows = document.querySelectorAll('table tr');
            const downloadUrls = [];
            // 遍历每个 <tr>
            tableRows.forEach(row => {
                // 检查当前 <tr> 是否包含 "Inactive" 文本
                if (row.textContent.includes('Inactive')) {
                    // 获取当前 <tr> 的 id
                    const rowId = row.id.replace("snatch", "");
                    if (rowId) {
                        var downloadUrl = "https://broadcasthe.net/torrents.php?action=download&id=" + rowId + "&authkey=" + authkey + "&torrent_pass=" + torrentPass;
                        downloadUrls.push(downloadUrl);
                    }
                }
            });
            downloadUrlsText = downloadUrls.join('\n');
        }

        // 将链接列表复制到剪贴板
        navigator.clipboard.writeText(downloadUrlsText)
            .then(() => {
                alert('下载链接已复制到剪贴板');
            })
            .catch(err => {
                console.error('复制到剪贴板时出错:', err);
                alert('复制到剪贴板时出错');
            });
    });
})();
