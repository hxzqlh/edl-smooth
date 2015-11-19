var player = $('#player')[0];
var player_1, player_2;
var curMediaIndex = 0;
var medias = [];
var tags = [];
// new: add tag
// edit: edit tag
var modal_type = "new";
var tagId = 0;

//slide width for every right/left hotkey
var stepSlide = 10;

//volume control for every up/down hotkey
var stepVolume = 0.1

var range = {
    start: 0,
    end: 0
};

$('#input').on ('change', function (e) {
    console.log (e.target.value);
    if (e.target.files) {
        medias = e.target.files;
        curMediaIndex = 0;
        //play from the first
        var url = URL.createObjectURL(medias[curMediaIndex]);
        player.src = url;
    }
});

player.onloadeddata = function () {
    tags = [];
 
    $('#preview_1').children().remove();;
    $('#preview_2').children().remove();;
    
    player_1 = player.cloneNode(true);
    player_2 = player.cloneNode(true);
    player_1.width=200;
    player_2.width=200;
    player_1.height=120;
    player_2.height=120;
    player_2.currentTime = player.duration;
    $('#preview_1').append(player_1);
    $('#preview_2').append(player_2);
    
    $('#videoFrameTable tbody tr').each (function (index, tr) {
        if (tr.children[0].innerHTML > 0) {
            $(tr).remove(); 
        }
    });
 
    $(player).css ('background','white');

    range.start = 0;
    range.end = player.duration;

    $('#timeStart').val('00:00:00');
    $('#timeEnd').val(time2hhmmss(player.duration).substr(0,8));

    $('#timeStart').prop ('defaultValue', '00:00:00');
    $('#timeEnd').prop ('defaultValue', time2hhmmss(player.duration).substr(0,8));

    $('#drag1').css('left', 0).show();
    $('#drag2').css('left', $('#drag2').parent().width() - $('#drag2').width()).show();
    $('#drag3').show();

    $('#rangeBar').css('left', 0).show();
    $('#rangeBar').css('width', $('#rangeBar').parent().width());
    
    $('#progressInRange').css('width',0).show();
};

player.ontimeupdate = function() { 
    if (player.currentTime >= range.end)
        player.pause();

    updateProgress ();
};

function updateProgress () {
    /*
                    drag1                             drag2
                    |                                 |
                    |-----------rangeWidth------------|
                    |                                 |
                    ||================================||
                    ||--progressInRange--||           ||
    =========================================================================
                    |                                 |
                    |                                 |
                   ts: range.start                   ts:range.end
                                   drag3
                                   |
                                   ||
                                   ||
    =========================================================================
                                   |
                                   |
                               ts:player.currentTime


      newLeft       player.currentTime - range.start       progressInRange
    ----------- = ----------------------------------- = ----------------------
     totalWidth         range.end - range.start               rangeWidth


    */
    //player
    var totalWidth = $('#drag3').parent().width();
    var newLeft = totalWidth * (player.currentTime - range.start) / (range.end - range.start); 
    newLeft = newLeft > totalWidth ? totalWidth : newLeft;
    newLeft = newLeft < 0 ? 0 : newLeft;
    $('#drag3').css('left', newLeft);

    //progress bar in range
    var rangeWidth = $('#rangeBar').width();
    var widthInRange = rangeWidth * (player.currentTime - range.start) / (range.end - range.start);
    $('#progressInRange').css('left', $('#drag1').position().left);
    $('#progressInRange').css('width', widthInRange);

    //currentTime
    $('#timeNow').val(time2hhmmss(player.currentTime));
}

player.onpause = function() { 
    console.log("paused"); 

    wjsButton = $(".icon-pause");
    if (wjsButton.length != 0) 
        wjsButton.removeClass("icon-pause").addClass("icon-play");

    $('#speedOver').hide ();
};

player.onplay = function () { 
    console.log("play"); 

    wjsButton = $(".icon-play");
    if (wjsButton.length != 0) 
        wjsButton.removeClass("icon-play").addClass("icon-pause");
    
    updateSpeed (1.0);
    $('#speedOver').show ();
};

player.onplaying = function () {
    console.log('onplaying ' + player.currentTime);
}

player.onended = function () {
    console.log(medias[curMediaIndex].name + ' play ended');

    playNext ();
}

$(document).bind ('keydown', 'right', function (e) {
    e.preventDefault ();
    console.log ('right key down');

    slideRangeBar ('right');
});

$(document).bind ('keydown', 'left', function (e) {
    e.preventDefault ();
    console.log ('left key down');

    slideRangeBar ('left');
});

$(document).bind ('keydown', 'up', function (e) {
    e.preventDefault ();
    console.log ('up key down');

    if (!canPlay())
        return false;

    if (player.volume + stepVolume > 1) {
        player.volume = 1;
    } else {
        player.volume += stepVolume;
    }    
});

$(document).bind ('keydown', 'down', function (e) {
    e.preventDefault ();
    console.log ('down key down');

    if (!canPlay())
        return false;

    if (player.volume - stepVolume < 0) {
        player.volume = 0;
    } else {
        player.volume -= stepVolume;
    }
     
});

$(document).bind ('keydown', 'space', function (e) {
    e.preventDefault ();
    console.log ('space key down');

    if (!canPlay())
        return false;

    togglePlay();
});


function canPlay (){
    return player.src && player.duration > 0 
            && player.videoWidth > 0 && player.videoHeight > 0 
            && !player.error;
}

function backward () {
    updateSpeed (0.5*player.playbackRate);
}

function forward () {
    updateSpeed (2.0*player.playbackRate);
}

function updateSpeed (rate) {
    if (rate < 0.0)
        return;

    player.playbackRate = rate;
    $('#speedOver .badge').html ('Speed: x' + player.playbackRate);
}

function togglePlay () {
    if (!player.paused) {
        player.pause();
   } else {
        player.play();
   }
}


$("#tag").bind("click", function(e) {
    e.preventDefault();

    if (!canPlay ()) return false;

    if (!player.paused) player.pause();
        
    resetDialog ();
    modal_type = "new";
    $('#tagModal').modal("show");
});


function loadTag (tag) {
    $('.modal-body input[name="remark"]').val(tag.remark);
    $('#decision_' + tag.decision).prop('checked',true);
}

$("#saveTag").bind("click", function(e) {
    e.preventDefault();

    var remark = $('.modal-body input[type="text"]')[0].value;
    var decision = $('.modal-body input[name="decision"]:checked').val();
    remark = !remark ? "" : remark;
    decision = !decision ? 0: decision;
 
    if (modal_type === "new") {
        var timeStamp = time2hhmmss(player.currentTime);
        var c = $("#videoFrameTable tbody tr:last").clone().show();
        $("#videoFrameTable tbody").append(c);

        //increase tag id
        tagId = Number(maxTagId()) + 1;
        $('#videoFrameTable tbody tr:last td:eq(0)').html(tagId);
        $('#videoFrameTable tbody tr:last td:eq(1)').html(timeStamp);
        $('#videoFrameTable tbody tr:last td:eq(2)').html(decision);
        $('#videoFrameTable tbody tr:last td:eq(3)').html(remark);
        
        $('#videoFrameTable tbody tr:last td:eq(4)').find("button").each(function () {
            if ($(this).hasClass ('btn-info')) {
                //edit tag
                $(this).bind ('click', function (e) {
                    var tr = this.parentElement.parentElement;
                    var tag = {};

                    tag.id = tr.children[0].innerHTML;
                    tag.timeCode = tr.children[1].innerHTML;                       
                    tag.decision = tr.children[2].innerHTML;                       
                    tag.remark = tr.children[3].innerHTML;                       

                    tagId = tag.id;
                    loadTag(tag);
                    modal_type = "edit";
                    $('#tagModal').modal("show");
                });
            } else if($(this).hasClass ('btn-danger')) {
                //remove tag
                $(this).bind ('click', function (e) {
                    var tr = this.parentElement.parentElement;
                    tagId = tr.children[0].innerHTML;
                    $('#confirmModal').modal("show");
                });
           }
        });
        $("#videoFrameResults").fadeIn("500");

        var tag = {
            "id": tagId,
            "timeStamp": timeStamp,
            "decision": decision,
            "mark": remark
        };
        tags.push(tag);
        
        $('#tagModal').modal("hide");
    } else if (modal_type === "edit") {
        //update tags
        tags.forEach (function (tag) {
            if (tag.id == tagId) {
                tag.decision = decision;
                tag.remark = remark;
            }
        });

        //update table
        $('#videoFrameTable tbody tr').each (function (index,tr) {
            if (tr.children[0].innerHTML == tagId) {
                tr.children[2].innerHTML = decision;
                tr.children[3].innerHTML = remark;
            }
        });

        resetDialog ();
        $('#tagModal').modal("hide");
    }
});

$("#confirmRemove").bind("click", function(e) {
    e.preventDefault();
    
    //remove tag
    tags.forEach (function (tag) {
        if (tag.id == tagId) {
            tags.splice (tags.indexOf (tag), 1);
        }
    });
   
    //update table
    $('#videoFrameTable tbody tr').each (function (index, tr) {
        if (tr.children[0].innerHTML == tagId) {
            $(tr).remove(); 
        }
    });
                    
    $('#confirmModal').modal("hide");
});


function resetDialog () {
    $('.modal-body input[type="text"]')[0].value = '';
    $('.modal-body input[name="decision"]').each (function (){
        this.checked = false;
    });
}

$("#export").bind("click", function(e) {
    e.preventDefault();

    if (!canPlay()) return false;

    download (JSON.stringify(tags), medias[curMediaIndex].name + '_edl.json', 'application/json');
});

function download (content, filename, contentType) {
    var blob = new Blob ([content], {'type':contentType});
    saveAs (blob, filename);
}

function maxTagId () 
{
    var maxId = 0;
    tags.forEach (function (tag) {
        maxId = (Number(tag.id) > maxId ? Number(tag.id) : maxId);
    });

    return maxId;
}

function isValidHHmmss (str) {
    var arr = str.split(":");

    if (arr.length != 3)
        return false;

    var mm = parseInt(arr[1])
    if (mm < 0 || mm >= 60)
        return false;

    var ss = parseInt(arr[2]);
    if (ss < 0 || ss >= 60)
        return false;

    return true;
}

function time2hhmmss(timeCodec) {
    timeCodec = timeCodec.toFixed(2);
    var arr = ('' + timeCodec).split(".");

    var total_secs = parseInt(arr[0], 10);
    var hours   = Math.floor(total_secs / 3600);
    var minutes = Math.floor((total_secs - (hours * 3600)) / 60);
    var seconds = total_secs - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {
        hours   = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    //"12.03"
    var hhmmss = '';
    if (arr.length == 2) {
        hhmmss = hours + ':' + minutes + ':' + seconds + '.' + arr[1];
    } 
    // "12"
    else if (arr.length == 1) {
        hhmmss = hours + ':' + minutes + ':' + seconds + '.00';
    }

    return hhmmss;
}

function hhmmss2num(str) {
    var arr = str.split(":");
    var cnt = arr.length;
    var i = 0, res = 0;

    for (i = 0; i < cnt; i +=1) {
        var unit = Math.pow(60, i);
        var num = parseInt(arr[cnt -i - 1]) * unit;
        res += num;
    }

    return res;
}

$( "#drag1" ).draggable({
    axis: "x",
    containment: "parent",
    start : function (e, ui) {
        console.log ('drag start');
    },
    drag : function (e, ui) {
        console.log ('drag1');
        if (ui.position.left + ui.helper.width()/2 > $('#drag2').position().left)
            return false;

        if (!canPlay ()) return false;
        if (!player.paused) player.pause();

        var newStart = (ui.position.left / ui.helper.parent().width()) * player.duration;
        range.start = newStart;
        
        //seek preview
        player_1.currentTime = range.start;
        $('#timeStart').val (time2hhmmss(newStart).substr(0,8));

        maybeRevisePlayer();
        replaceRange();
        updateProgress ();
   },
    stop : function (e, ui) {
        console.log ('drag stop');
    }
});

$( "#drag2" ).draggable({
    axis: "x",
    containment: "parent",
    drag : function (e, ui) {
        console.log ('drag2');
        if (ui.position.left < $('#drag1').position().left + $('#drag1').width()/2)
            return false;

        if (!canPlay ()) return false;
        if (!player.paused) player.pause();

        var newEnd = ((ui.position.left + ui.helper.width())/ ui.helper.parent().width()) * player.duration;
        range.end = newEnd;
           
        //seek preview
        player_2.currentTime = range.end;
        $('#timeEnd').val (time2hhmmss(newEnd).substr(0,8));

        maybeRevisePlayer();
        replaceRange();
        updateProgress ();
    },
});

$( "#drag3" ).draggable({
    axis: "x",
    containment: "parent",
    drag : function (e, ui) {
        console.log ('drag3');

        if (!canPlay ()) return false;
        if (!player.paused) player.pause();

        var newStart = (ui.position.left / ui.helper.parent().width()) * (range.end - range.start) + range.start;
        player.currentTime = newStart;
        console.log ('drag3 move, currentTime: ' + player.currentTime);
    },
});

$( "#rangeBar" ).draggable({
    axis: "x",
    containment: "parent",
    drag : function (e, ui) {
        console.log ('range bar ');

        if (!canPlay ()) return false;
        if (!player.paused) player.pause();

        //drag1,drag2 move
        $('#drag1').css('left', ui.position.left - $('#drag1').width() / 2);
        $('#drag2').css('left', ui.position.left + ui.helper.width() - $('#drag2').width() / 2);

        updateRange();
        maybeRevisePlayer();
        updateProgress();  
    },
});

function slideRangeBar (direction) {
    if (!canPlay ()) return false;
    if (!player.paused) player.pause();

    var step = stepSlide;

    //replace drag1,drag2
    if (direction === 'right') {
        if ($('#drag2').position().left + step + $('#drag2').width() >= $('#drag2').parent().width()) {
            step = $('#drag2').parent().width() - ($('#drag2').position().left +  $('#drag2').width());
        }

        $('#drag1').css('left', $('#drag1').position().left + step);
        $('#drag2').css('left', $('#drag2').position().left + step);
    } else if (direction === 'left') {
        if ($('#drag1').position().left - step <= 0) {
            step = $('#drag1').position().left;
        }

        $('#drag1').css('left', $('#drag1').position().left - step);
        $('#drag2').css('left', $('#drag2').position().left - step);
    }

    maybeRevisePlayer();
    replaceRange();
    updateRange();
    updateProgress();  
}

$('#timeStart').on ('change', function (e) {
    console.log ('start time change');

    onRangeTimeUpdate ('timeStart', e.target.value);
});

$('#timeEnd').on ('change', function (e) {
    console.log ('end time change');

    onRangeTimeUpdate ('timeEnd', e.target.value);
});

function replaceRange () {
    $('#rangeBar').css ('left', $('#drag1').position().left + $('#drag1').width() / 2);
    $('#rangeBar').css ('width', $('#drag2').position().left - $('#drag1').position().left + $('#drag2').width() / 2);
}

function updateRange () {
    var newStart = ($('#drag1').position().left / $('#drag1').parent().width()) * player.duration;
    var newEnd = (($('#drag2').position().left + $('#drag2').width()) / $('#drag2').parent().width()) * player.duration;
    range.start = newStart;
    range.end = newEnd;
    $('#timeStart').val (time2hhmmss(newStart).substr(0,8));
    $('#timeEnd').val (time2hhmmss(newEnd).substr(0,8));
    player_1.currentTime = newStart;
    player_2.currentTime = newEnd;
}

function onRangeTimeUpdate (elemId, val) {
    if (!canPlay ()) return false;
    if (!player.paused) player.pause();

    if (!isValidHHmmss (val)) {
        $('#timeModal .modal-body p').html('Wrong time code format!')
        $('#timeModal').modal ('show');
        return false;
    }

    var newTime = hhmmss2num(val)
    if (newTime > player.duration) {
        $('#' + elemId).val ($('#' + elemId).prop ('defaultValue'));

        $('#timeModal .modal-body p').html('Time code exceeded video length!')
        $('#timeModal').modal ('show');
        return false;
    }

    if (elemId === 'timeStart') {
        if (newTime > range.end) {
            $('#' + elemId).val ($('#' + elemId).prop ('defaultValue'));

            $('#timeModal .modal-body p').html('Time start exceeded time end!')
            $('#timeModal').modal ('show');
            return false;
        }

        range.start = newTime;
        player_1.currentTime = range.start;
    }

    if (elemId === 'timeEnd') {
        if (newTime < range.start) {
            $('#' + elemId).val ($('#' + elemId).prop ('defaultValue'));

            $('#timeModal .modal-body p').html('Time end smaller than time start!')
            $('#timeModal').modal ('show');
            return false;
        }
    
        range.end = newTime;
        player_2.currentTime = range.end;
    }

    $('#' + elemId).prop ('defaultValue', val);
    
    /*
        range.start          drag1.left
      ----------------- = ----------------
       player.duration       totalWidth
    */
    $('#drag1').css('left', range.start * $('#drag1').parent().width() / player.duration);
    $('#drag2').css('left', range.end * $('#drag2').parent().width() / player.duration);

    maybeRevisePlayer();
    replaceRange();
    updateProgress();
}

//make sure player time of drag3 is between the time ofdrag1 and drag2
function maybeRevisePlayer ()
{
    if ($('#drag1').position().left >= $('#progressInRange').position().left +  $('#progressInRange').width()) {
        player.currentTime = range.start;
    }

    if ($('#drag2').position().left <= $('#progressInRange').position().left +  $('#progressInRange').width()) {
        player.currentTime = range.end;
    }
}

function fullscreen () 
{
    var elem = player;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
}

function playNext () {
    curMediaIndex = (curMediaIndex + 1) % medias.length;
    var url = URL.createObjectURL(medias[curMediaIndex]);
    player.src = url;
    player.play();
}

function preview (video) {
    var alt = time2hhmmss(video.currentTime);
    var a = document.createElement("canvas");
    var ctx = a.getContext("2d");
    a.width = 200;;
    a.height = 120;
    ctx.fillRect (0, 0, a.width, a.height);
    ctx.drawImage (video, 0, 0, a.width, a.height);
    var url = a.toDataURL("image/jpeg");
    $("#videoFrameScreenshots ul").append(
        '<li style="display:none;">' + 
            '<a href="javascript:void(0);" class="thumbnail"><img src="' + url + '" alt="' + alt + '"/><p style="text-align:center">' + alt + '</p>' + 
            '</a>' + 
        '</li>').after(function() {
            $("#videoFrameScreenshots li").fadeIn("500")
        });
    $("#videoFrameScreenshots").fadeIn("500");
}
