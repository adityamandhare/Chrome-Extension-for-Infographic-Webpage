var newURL = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;
console.log(String(newURL));
console.time();

var array = [];
var hash = new Object();

var regex =  /(fig|figure|fig.|Fig.|image|img|img.)[\s][0-9]/gi;

newBody = document.body.innerHTML;

array = newBody.toString().match(regex);
//console.log(array)
var arrayOfWords=[];
for (var i = 0; i < array.length; i++)
{ 
    if(arrayOfWords.indexOf(array[i])<0){
        arrayOfWords.push(array[i].toString());
    }
}
console.log(arrayOfWords);

var images = document.getElementsByTagName("img");

for (var i = 0; i < arrayOfWords.length; i++)
{
    for(var j = 0; j < images.length; j++)
    {

        if(images[j].alt.indexOf(arrayOfWords[i])>-1)
        {
            if(images[j].src!=undefined){
                hash[arrayOfWords[i]] = images[j].src;
                //alert(arrayOfWords[i]);
                //alert(hash[arrayOfWords[i]]);
            }
        }
    }
}

var keys = Object.keys(hash);

console.log(keys);

for(var i = 0; i < keys.length; i++)
    {
        var exp = /\d+/gi;
        var num = keys[i].toString().match(exp)[0];

        for(var j = 0; j < arrayOfWords.length; j++)
        {
            var exp1 = /\d+/gi;
            var num1 = arrayOfWords[j].toString().match(exp1)[0];

            if(num == num1){

                hash[arrayOfWords[j]] = hash[keys[i]];
            }
        }

    }

console.log(hash);

for (var i = 0; i < arrayOfWords.length; i++)
{    
    var img = hash[arrayOfWords[i]];
        if(img != undefined)
        {
            var rep = "<a href="+img+" "+"target='_blank'"+" "+"onClick=window.open("+img+")>"+ arrayOfWords[i] + "</a>";   
            var r = new RegExp(arrayOfWords[i], 'gi');
            newBody = newBody.replace(r, rep);
            console.log(arrayOfWords[i]);
            console.log(rep);
        }
}

console.time();
document.body.innerHTML = newBody;