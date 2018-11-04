var inputbar, gotoButton, website

function ajax(domain, callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    xhttp.open("GET", domain, true);
    xhttp.send();
}

function customStyles(){
    let style = document.createElement('style');
    style.type = 'text/css';

    const css = `
    body{background-color: #a99}
    `

    if (style.styleSheet){
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    return style;
}
function customScripts(){
    let script = document.createElement('script');
    const js = `
    document.querySelectorAll("img").forEach(imgNode => {
        imgNode.addEventListener("click", function(event){
            event.preventDefault();
            event.stopPropagation();
            this.src = this.getAttribute("data-src");
        });
    });
    document.querySelectorAll("a").forEach(function(element) {
        element.addEventListener("click", function(event){
            event.preventDefault();
            event.stopPropagation();
            const customEvent = new CustomEvent('pagechange', { detail: document.activeElement.href });
            window.parent.document.dispatchEvent(customEvent);
        });
    });
    document.addEventListener("beforeunload", function(){
        console.log("pagechange");
        /*var pagechange = { document.activeElement.href };
        var event = new CustomEvent('pagechange', { detail: pagechange });
        window.parent.document.dispatchEvent(event);*/
    });
    `
    script.appendChild(document.createTextNode(js));
    return script;
}
function cleanUp(page){
    const currentUrl = new URL(inputbar.value);
    const host = `${currentUrl.protocol}//${currentUrl.hostname}`;
    /* fix links */
    page.querySelectorAll("a, link").forEach(a => {
        if(!a.href.includes("http")){
            a.href= host + a.getAttribute("href");
        }
    });
    /* fix script tags */
    page.querySelectorAll("script").forEach(script => {
        if(!script.src.includes("http")){
            script.src= host + script.getAttribute("src");
        }
        // script.setAttribute("defer", "");
    });
    /* unload images */
    page.querySelectorAll("img").forEach(imgNode => {
        let imgSrc = imgNode.getAttribute("src");
        if(!imgSrc.includes("http")){
            imgSrc = host + imgSrc;
        }
        imgNode.setAttribute("data-src", imgSrc);
        imgNode.setAttribute("alt", "click to load image - " + imgNode.getAttribute("alt"));
        imgNode.src = "";
    });
}

function showPage(html){
    parser = new DOMParser()
    const newPage = parser.parseFromString(html, "text/html");
    cleanUp(newPage);
    newPage.querySelector("body").appendChild(customStyles());
    newPage.querySelector("body").appendChild(customScripts());
    website.srcdoc = `<html>
        <head>${newPage.head.innerHTML}</head>
        <body>${newPage.body.innerHTML}</body>
    </html>`;
}

function navigateTo(){
    const url = inputbar.value;
    ajax(url, showPage)
}

function initialize(){
    console.log("DOM fully loaded and parsed");
    inputbar = document.querySelector("input.searchbar");
    gotoButton = document.querySelector("button.goto");
    website = document.querySelector(".webpage");

    gotoButton.addEventListener("click", navigateTo);
    window.document.addEventListener('pagechange', function(event){
        console.log("new", event)
        inputbar.value = event.detail;
        navigateTo();
    }, false)

}

document.addEventListener("DOMContentLoaded", initialize);