function colorHandler(colorData) {
    $.getJSON("./server/database/colorDatabase.json", function (data) {
        var colorData = data;

        //var currentHour = new Date().getHours();
        var currentHour = 11;
        
        var nextHour;
        var previousHour;
        //Checkt an welcher Zeiteinstellung die Aktuelle Uhrzeit näher dran ist
        if ((currentHour % 6 - 3) < 0) {
            nextHour = currentHour - (currentHour % 6);
        } else {
            nextHour = currentHour + (6 - (currentHour % 6));
        }
        
        previousHour = nextHour - 6;
        if (previousHour < 0) {
            previousHour = 24;
        }
        if(nextHour == 6){
            $('.st6').toggleClass('sunrise');
        }
        if(nextHour == 24){
            $('.st6').toggleClass('sunset');
        }
        
        

        COLOR_TEMPLATE_PUSH(colorData[nextHour], colorData[previousHour]);
    });
}

function COLOR_TEMPLATE_PUSH(nextColorInformation, previousColorInformation) {
    console.log(nextColorInformation);
    console.log(previousColorInformation);
    var animationDuration = 7;

    $('.phone-wrapper, .suggestion').css('background', previousColorInformation.Mountains.lowMountains + '!important');

    
    console.log(previousColorInformation.Decoration.decorationBackground);
    $('.st6').css({ fill:  previousColorInformation.Decoration.decorationBackground });
    
    $('#backgroundLow').html(' <animate  attributeName="stop-color" from="' + previousColorInformation.Background.lowBackground + '" to="' + nextColorInformation.Background.lowBackground + '" dur="' + animationDuration + '" fill="freeze"/>');

    $('#backgroundMid').html(' <animate  attributeName="stop-color" from="' + previousColorInformation.Background.midBackground + '" to="' + nextColorInformation.Background.midBackground + '" dur="' + animationDuration + '" fill="freeze"/>');

    $('#backgroundHigh').html(' <animate  attributeName="stop-color" from="' + previousColorInformation.Background.highBackground + '" to="' + nextColorInformation.Background.highBackground + '" dur="' + animationDuration + '" fill="freeze"/>');

    $('#highMountains').html(' <animate  attributeName="stop-color" from="' + previousColorInformation.Mountains.highMountains + '" to="' + nextColorInformation.Mountains.highMountains + '" dur="' + animationDuration + '" fill="freeze"/>');

    $('#lowMountains').html(' <animate  attributeName="stop-color" from="' + previousColorInformation.Mountains.lowMountains + '" to="' + nextColorInformation.Mountains.lowMountains + '" dur="' + animationDuration + '" fill="freeze"/>');

    $('#highlightsHigh1, #highlightsHigh2, #highlightsHigh3, #highlightsHigh4').html(' <animate  attributeName="stop-color" from="' + previousColorInformation.MountainDetails.highMountainDetails + '" to="' + nextColorInformation.MountainDetails.highMountainDetails + '" dur="' + animationDuration + '" fill="freeze"/>');

    $('#highlightsLow1, #highlightsLow2, #highlightsLow3, #highlightsLow4').html(' <animate  attributeName="stop-color" from="' + previousColorInformation.MountainDetails.lowMountainDetails + '" to="' + nextColorInformation.MountainDetails.lowMountainDetails + '" dur="' + animationDuration + '" fill="freeze"/>');
    
    

    $('.phone-wrapper, .suggestion').css('background', nextColorInformation.MountainDetails.lowMountainDetails).css('transition:' + animationDuration  + 's ease-in');

    $('body').css('background', nextColorInformation.Background.highBackground);
}
