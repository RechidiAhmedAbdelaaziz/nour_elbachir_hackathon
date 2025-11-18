import axios from 'axios';
async function checkDeepFake(imageUrl) {
    const api_user = '16335105';
    const api_secret = 'DptAiwNM3HqmbmciVkjwTiLKZRHrxcCn';
    axios.get('https://api.sightengine.com/1.0/check.json', {
        params: {
            'url': imageUrl,
            'models': 'genai',
            'api_user': api_user,
            'api_secret': api_secret,
        }
    })
        .then(function (response) {
        // on success: handle response
        console.log(response.data);
    })
        .catch(function (error) {
        // handle error
        if (error.response)
            console.log(error.response.data);
        else
            console.log(error.message);
    });
}
checkDeepFake('https://pbs.twimg.com/card_img/1990805211816824832/sSzCrJDx?format=jpg&name=small');
//# sourceMappingURL=script.js.map