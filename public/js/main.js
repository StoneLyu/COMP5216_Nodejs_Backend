$(document).ready(function () {

    loadCommentAsync();
    onDisapprovalClick();
    onApproval();
    onSaveClick();
});

var loadCommentAsync = function () {
    let url = '/api/news/' + "<%= news[0]._id%>" +'/comment';
    let jqxhr = $.get(url);

    jqxhr.done(function (result) {
        let content = "";
        result.forEach(function (value) {
            let dateObj = new Date(value.date);
            let m = dateObj.getMonth() - 0 + 1;
            let d = dateObj.getFullYear() + "-" + m + "-" + dateObj.getDay() + " "
                + dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds();


            content = content + "<li class=\"list-group-item card-text rounded\">" +
                "<ul class=\"list-inline \">" + "<li class=\"list-inline-item\">" +
                value.userId + "</li>";
            if (value.replyToId != null) {
                content = content + "<li class=\"list-inline-item\">Reply to:" + value.replyToId + "</li>";
            }

            content = content + "<li class=\"list-inline-item\">" + d + "</li>" + "</ul>" +
                "<p class=\"text-body\">" + value.content +"</p></li>"
            $('#commentBody').html(content);
        });
    });

    jqxhr.fail(function (result) {
        $('#commentBody').html("comment load failed!");
    });
};

var onDisapprovalClick = function () {
    // disapproval click
    $('#disapproval').on('click', function () {
        var newsId = $('#newsId').val();
        var jqxhr = $.post('/api/news/', {newsId: newsId, vote: -1});

        jqxhr.done(function (result) {
            if (result[1].nModified === 1){
                let val = $('#voteValue').html() - 1;
                $('#voteValue').html(val);
            }
        });

        jqxhr.fail(function (result) {
            alert("vote failed, please try again!")
        });
    });
};

var onApproval = function () {
    //approval
    $('#approval').on('click', function () {
        var newsId = $('#newsId').val();
        var jqxhr = $.post('/api/news/', {newsId: newsId, vote: 1});

        jqxhr.done(function (result) {
            if (result[1].nModified === 1){
                let val = $('#voteValue').html() - 0 + 1;
                $('#voteValue').html(val);
            }
        });

        jqxhr.fail(function (result) {
            alert("vote failed, please try again!")
        });
    });
};

var onSaveClick = function() {
    $('#saveButton').on('click', function () {
        let newsId = $('#newsId').val();
        let userId = '5b9a16bfc5fda55c3852ef27';
        let isSaved = false;

        if (isSaved) {
            var jqxhr = $.delete('/api/bookmark', {newsId:newsId, userId:userId});
            jqxhr.done(function (result) {
                if (result.code === 2) {
                    $('#saveButton').html('save');
                    isSaved = false;
                }
            });

            jqxhr.fail(function (result) {
                alert('deleting operation failed!');
            });
        } else {
            var jqxhr = $.post('/api/bookmark', {newsId:newsId, userId:userId});

            jqxhr.done(function (result) {
                if (result.code === 2) {
                    $('#saveButton').html('delete');
                    isSaved = true;
                }
            });

            jqxhr.fail(function (result) {
                alert('saving operation failed!');
            });
        }
    });
};