var newURL = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;
console.log(String(newURL));
console.time();

if (typeof CS == "undefined") {
    CS = function() {
        this.initialize();
    };
    
    var posY;//document.documentElement.scrollTop;
    var posX;

    CS.prototype = {
        initialize: function() {
            this.targetImageUrls = new Array();
            this.isHoverZoom = true; //chg
        },
        start: function() {
            this.fetchAndSendImages();
            chrome.extension.onMessage.addListener(
                this.hitch(function(message, sender) {
                    this.onReceiveMessage(message, sender);
                })
            );
        },
        onReceiveMessage: function(message, sender) {
            var operation = message.operation;

                var images = message.images;
                var position = message.position;   // Change here for custom postion
                var tabId = message.tabId;
                this.previewImages(images, position, tabId);

        },
        fetchAndSendImages: function() {
            var images = this.getImages();
            this.sendImagesMessage(images);
        },
        getImages: function() {
            var imgs = document.getElementsByTagName("img");
            var images = new Array();
            for (var i = 0; i < imgs.length; i++) {
                if (imgs[i].dataset.ics) {
                    continue;
                }
                var imgSrc = imgs[i].src;
                var width = Math.max(imgs[i].width, imgs[i].naturalWidth);
                var height = Math.max(imgs[i].height, imgs[i].naturalHeight);
                var top = imgs[i].getBoundingClientRect().top;
                var url = imgSrc;
                var img = {
                    tag: "img",
                    url: imgSrc,
                    width: width,
                    height: height,
                    hasLink: false,
                    pos: top
                };
                var parent = imgs[i].parentNode;
                if (parent.nodeType == Node.ELEMENT_NODE
                    && parent.nodeName.toLowerCase() == "a") {
                    var href = parent.href;
                    if (href != imgSrc) {
                        images.push({
                            tag: "a",
                            url: href,
                            width: Number.MAX_VALUE,
                            height: Number.MAX_VALUE,
                            pos:top
                        });
                        img.hasLink = true;
                        url = href;
                    }
                }
                images.push(img);
                var eventHandlingTarget = img.hasLink ? parent : imgs[i];
                eventHandlingTarget.addEventListener(
                    "mouseover",
                    (function(self, imageUrl) {
                        return function(evt) {
                            if (evt.shiftKey) {
                                self.onMouseOverImg(imageUrl);
                            }
                        };
                    })(this, url),
                    false);
            }
            return images;
        },
        
       /* onMouseOverImg: function(url) {
            if (this.isHoverZoom && this.isTargetImage(url)) {
                var img = document.getElementById("ics_hover_zoom");
                if (img) {
                    document.body.removeChild(img);
                }
                var clientWidth = document.documentElement.clientWidth;
                var clientHeight = document.documentElement.clientHeight;
                img = document.createElement("img");
                img.id = "ics_hover_zoom";
                img.style.position = "fixed";
                img.style.border = "5px solid darkgray";
                img.addEventListener("load", this.hitch(function(evt) {
                    var imageWidth = Math.max(img.width, img.naturalWidth);
                    var imageHeight = Math.max(img.height, img.naturalHeight);
                    var rateWidth = clientWidth / imageWidth;
                    var rateHeight = clientHeight / imageHeight;
                    var rate = Math.min(rateWidth, rateHeight) * 0.95;
                    img.width = imageWidth * rate;
                    img.height = imageHeight * rate;
                    img.style.top = String((clientHeight - img.height) / 2) + "px";
                    img.style.left = String((clientWidth - img.width) / 2) + "px";
                }), false);
                img.src = url;
                document.body.appendChild(img);
                img.addEventListener("click", function(evt) {
                    document.body.removeChild(img);
                }, false);
            }
        },
        isTargetImage: function(url) {
            for (var i = 0; i < this.targetImageUrls.length; i++) {
                if (this.targetImageUrls[i] == url) {
                    return true;
                }
            }
            return false;
        },*/
        
        
        
        sendImagesMessage: function(images) {
            var message = {
                type: "parsed_images",
                images: images
            };
            chrome.extension.sendMessage(message);
        },
        
        
        
        
        
        previewImages: function(images, position, tabId) {
            var panel = this.createPreviewPanel(position);
            document.body.appendChild(panel);
            this.createPreviewClose(panel);
            this.createPreviewImages(images, panel, tabId);
            this.createPreviewOption(panel);
        },
        
        
        createPreviewPanel: function(position) {
            var panel = document.getElementById("ics_preview_panel");
            if (panel) {
                panel.innerHTML = "";
            } else {
                panel = document.createElement("div");
                panel.id = "ics_preview_panel";
                panel.style.position = "fixed";
                panel.style.width = "200px";
                
                // changes for custom position of pan
                
                
               /* if (position.indexOf("top") != -1) {
                    panel.style.top = 0;
                }if (position.indexOf("bottom") != -1) {
                    panel.style.bottom = 0;
                }
                if (position.indexOf("left") != -1) {
                    panel.style.left = 0;
                }
                if (position.indexOf("right") != -1) {
                    panel.style.right = 0;
                }*/
                
                panel.style.bottom = "150px";
                panel.style.right = 0;
                
                panel.style.overflow = "auto";
                panel.style.paddingBottom = "50px";
            }
            return panel;
        },
        createPreviewImages: function(images, panel, tabId) {
            var failedImageCount = 0;
            console.log(images);
            for (var i = 0; i < images.length; i++) {
                var img = document.createElement("img");
                img.src = images[i].url;
                img.style.width = "85px";
                img.style.marginLeft = "90px";
                img.style.marginRight = "10px";
                img.style.marginTop = "10px";
                img.style.cursor = "pointer";
                img.dataset.ics = "true";
                
                // hover over image to get to the location
                img.onmouseover = (function(image) {
                    return function(evt) {
                        console.log(String("hover over image"+ image));
                        var pos = image.pos;
                        posY = document.body.scrollTop;
                        window.scrollTo(-1, pos-100);
                    };
                })(images[i]);

                // to return back to original position
                img.onmouseout = (function(image) {
                    return function(evt) {
                        console.log(String("hover away from image"+ image));
                        window.scrollTo(-1, posY);
                    };
                })(images[i]);
                
                // change here for implementing hover
                img.onclick = (function(image) {
                    return function(evt) {
                        console.log(String("Clicked on image"+ image));
                        var pos = image.pos;
                        window.scrollTo(-1, pos-100);
                        img.style.width = "150px";
                    };
                })(images[i]);
                
                // removes childs from getting in the way
                
                
               img.onerror = this.hitch((function(img) {
                    return function() {
                        panel.removeChild(img);
                        failedImageCount++;
                        if (failedImageCount >= images.length) {
                            document.body.removeChild(panel);
                            this.sendDisableButtonMessage(tabId);
                        }
                    }
                })(img));
                if (i == images.length - 1) {
                    img.onload = this.hitch(function() {
                        this.adjustPreviewPanelHeight(panel);
                    });
                }
                panel.appendChild(img);
            }
        },
        
        // Size and control starts
        
        sendDisableButtonMessage: function(tabId) {
            var message = {
                type: "disable_button",
                tabId: tabId
            };
            chrome.extension.sendMessage(message);
        },
        
        
        
        sendDismissHotPreviewMessage: function() {
            var message = {
                type: "dismiss_hotpreview"
            };
            chrome.extension.sendMessage(message);
        },
        
        
        
        adjustPreviewPanelHeight: function(panel) {
            var clientHeight = document.documentElement.clientHeight;
            if (panel.clientHeight > (clientHeight / 2)) {
                panel.style.height = String(clientHeight / 2) + "px";
            }
        },
        
        
        createPreviewClose: function(panel) {
            var close = this.createLinkDiv("Hide");
            panel.appendChild(close);
            close.onclick = function(evt) {
                document.body.removeChild(panel);
            };
        },
        
        
        
        createPreviewOption: function(panel) {
            var option = this.createLinkDiv("Option");
            panel.appendChild(option);
            option.onclick = function(evt) {
                var url = chrome.extension.getURL("options.html");
                location.href = url;
            };
            var dismiss = this.createLinkDiv("Dismiss");
            panel.appendChild(dismiss);
            dismiss.onclick = this.hitch(function(evt) {
                this.sendDismissHotPreviewMessage();
                document.body.removeChild(panel);
            });
        },
        
        
        createLinkDiv: function(label) {
            var link = document.createElement("div");
            link.style.textAlign = "center";
            link.style.textDecoration = "underline";
            link.style.cursor = "pointer";
            link.style.fontSize = "9px";
            link.style.marginTop = "5px";
            link.appendChild(document.createTextNode(label));
            return link;
        },
        
        
        hitch: function(f) {
            var self = this;
            return function() {
                f.apply(self, arguments);
            };
        }
    };
}

var cs = new CS();
cs.start();
