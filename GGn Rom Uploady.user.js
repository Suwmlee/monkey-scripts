// ==UserScript==
// @name         GGn Rom Uploady
// @namespace    https://github.com/Suwmlee/monkey-scripts
// @version      0.5
// @description  rom Uploady for GGn
// @author       cat, suwmlee
// @match        https://gazellegames.net/upload.php*
// @require      https://code.jquery.com/jquery-3.1.1.min.js
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// ==/UserScript==

function set_name(str) {
    var torrent_name = str.replace('C:\\fakepath\\', '')
    var file_name = torrent_name.replace('.torrent', '')
    var rom_name = file_name.replace(".zip", "")
    var game_name = rom_name.replace(/\(.+\)/, "")
    return { 'file_name': file_name, 'rom_name': rom_name, 'game_name': game_name };
}

function fill_form(url) {
    var name_info = set_name($('#file').val())
    var rld = `[align=center] ${name_info.file_name} matches [url=${url}]No-Intro checksums[/url]
                            Compressed with torrentzip
                            [/align]`
    // $('#ripsrc_home').prop("checked")
    $('#miscellaneous').val("ROM")
    // $('#title').val(name_info.game_name)
    $('#release_title').val(name_info.game_name)
    $('#release_desc').val(rld)
    // $('#platform').val("Game Boy Advance")
    $('#anonymous').prop("checked", true)
    $('#remaster').prop("checked", true)
    // using GGn deafult method
    Remaster()
    $('#remaster_title').val("No-Intro")
    var mobyyear = $("#year").val()
    if (mobyyear) $('#remaster_year').val(mobyyear);
}
(function () {
    'use strict';
    if (window.location.href.includes("gazellegames")) {
        $('#releaseinfo > tbody > tr').eq(0).after(
            `<tr><td class='label'></td><td>
            <input id='fill_rom' type='button' value='ROM'/>
            <input id='NoIntro_Check' type='button' value='No-Intro Checksums'/>
            </td></tr>`
        )
    }

    $("#fill_rom").click(function () { //After the "appid" input loses focus
        var mobyplatform = $("#platform").val()
        var name_info = set_name($('#file').val())
        switch (mobyplatform) {
            // if you want support more platform,
            // copy this case and paste, and change platform number, you can find the right number in `https://datomatic.no-intro.org` 
            // here "nintendo ds" is 147
            case "Nintendo DS":
                GM.xmlHttpRequest({
                    method: "POST",
                    url: "https://datomatic.no-intro.org/index.php?page=search&s=147",
                    data: "text=" + name_info.rom_name,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    onload: function (response) {
                        // var pp = $("table[class='info-table']",response.responseText)
                        var modlist = $('a[href*="page=show_record"]', response.responseText);
                        var NoIntroUrl = undefined
                        if (modlist.length === 1) {
                            NoIntroUrl = "https://datomatic.no-intro.org/index.php" + modlist.attr('href')
                        }
                        fill_form(NoIntroUrl)

                        // FOR TESTING
                        // var w = window.open('about:blank');
                        // w.document.open();
                        // w.document.write(response.responseText);
                        // w.document.close();
                    }
                });
                break;
            case "Game Boy Advance":
                var request = GM.xmlHttpRequest({
                    method: "GET",                  //We call the Steam API to get info on the game
                    url: "https://objectstorage.ap-tokyo-1.oraclecloud.com/n/nrmpw4xvtvgl/b/bucket-20200224-2012/o/GBA.json",
                    responseType: "json",
                    onload: function (response) {
                        var url = undefined
                        if (name_info.rom_name) {
                            url = response.response[name_info.rom_name]
                        }
                        fill_form(url)
                    }
                });
                break;
            default:
                fill_form()
                break;
        }
    });
    $("#NoIntro_Check").click(function () {
        var mobyplatform = $("#platform").val()
        switch (mobyplatform) {
            case "Nintendo DS":
                window.open("https://datomatic.no-intro.org/index.php?page=search&s=147");
                break;
            default:
                window.open("https://datomatic.no-intro.org/index.php?page=search&s=23");
                break;
        }
    })

})();
