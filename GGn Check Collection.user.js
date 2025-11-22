// ==UserScript==
// @name         GGn Check Collection
// @namespace    https://github.com/Suwmlee/monkey-scripts
// @version      0.2
// @description  better style for Check a collection page
// @author       suwmlee
// @match        https://gazellegames.net/better.php*
// ==/UserScript==
var basestyle = ".hover { background-color:#169b2c; }";

function addStyle(style)
{
    var headelem = document.getElementsByTagName("head")[0];
    var styleelem = document.createElement("style");
    styleelem.setAttribute("id","customtheme");
    styleelem.type="text/css";
    styleelem.appendChild(document.createTextNode(style));
    headelem.appendChild(styleelem);
}

(function () {
    'use strict';
    addStyle(basestyle)
    if (window.location.href.includes("gazellegames")) {
        $('#collection_files tr').hover(function() {
            $(this).addClass('hover');
        }, function() {
            $(this).removeClass('hover');
        });
    }

})();
