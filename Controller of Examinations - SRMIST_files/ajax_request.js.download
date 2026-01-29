var REK = '6NitGRUTASKAAM1kxXLJ1YSzLokPtx8XGCHj8_VV';

let send_ajax_request = (url, method, data, successCallback, completeCallBack, beforeSendCallback, errorCallBack, headers,options) => {
    var requestHeaders = {};
    if( typeof headers ==="object"){
        requestHeaders  = headers;
    }
    if( typeof jsVars.requestCsrf ==="string"){
        requestHeaders['token']  = jsVars.requestCsrf;
    }
    if(typeof jsVars.dynamicRequest !== 'undefined' && jsVars.dynamicRequest == true){
        data['dynamicRequest']  = jsVars.dynamicRequest;
    }
    var dataType    = 'json';
    if(typeof options === "object" && typeof options['dataType'] === "string"){
        dataType = options['dataType'];
    }
    var async    = true;
    if(typeof options === "object" && typeof options['async'] === "string"){
        async = false;
    }
    $.ajax({
            url: url,
            type: method,
            headers: requestHeaders,
            data: prepareAjaxRequest(data),
            async: async,
            dataType: dataType,
            beforeSend : function(){
                if( typeof beforeSendCallback ==="function"){
                    beforeSendCallback();
                }
            },
            complete:function() {
                if( typeof completeCallBack ==="function"){
                    completeCallBack();
                }
            },
            success: function (response) {
                if( typeof response ==="object"){
                    if( typeof response.redirect==="string"){
                        window.location.replace(response.redirect);
                    }
                    if( typeof response.error!=="undefined" && response.error==="csrf"){
                        alertErrorPopup('Please refresh the page and try again.');
                    }
                    if( typeof response.status!=="undefined" && response.status===0 && typeof response.message==="string" && response.message==="csrf"){
                        alertErrorPopup('Please refresh the page and try again.');
                    }
                }
                if( typeof successCallback ==="function"){
                    successCallback(response);
                }
            },
            error: function(xhr, ajaxOptions, thrownError){
                if( typeof errorCallBack ==="function"){
                    errorCallBack(xhr, ajaxOptions, thrownError);
                }
            }
    });
};

function alertErrorPopup(msg, location) {
    var selector_parent = '#ErrorPopupArea';
    var selector_msg = '#ErrorMsgBody';
    var btn = '#ErrorOkBtn';
    var title_msg = 'Error';
    
    if($(selector_parent).length){
        $(selector_parent).find(".modal-title").html(title_msg);
        $(selector_msg).html(msg);
        $('.oktick').hide();

        if (typeof location !== 'undefined') {
            $(btn).show();

            $(selector_parent).modal({keyboard: false}).one('click', btn, function (e) {
                e.preventDefault();
                window.location.href = location;
            });
        }
        else {
            $(selector_parent).appendTo('body');
            $(selector_parent).modal();
        }
    }else{
        alert(msg);
    }
}
