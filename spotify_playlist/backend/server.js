const express = require('express');
const bodyParser = require('body-parser');
const qs = require('qs');
const config = require('./config.json');

const client_id = config.client_id;
const redirect_uri = config.redirect_uri;
const client_secret = config.client_secret;

const app = express();
const axios = require('axios');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(allowCrossDomain);


app.get('/login', function(req, res) {

    res.redirect('https://accounts.spotify.com/authorize?' +
        qs.stringify({
            client_id: client_id,
            response_type: 'code',
            redirect_uri: redirect_uri
        })
    )
});

app.get('/callback', function(req, res) {

    const code = req.query.code || null;
    const state = req.query.state || null;
    const error = req.query.error || null;
    const str = client_id + ':' + client_secret;
    const buf1 = Buffer.from(str);
    const Authorization = 'Basic ' + buf1.toString('base64');

    let url = 'https://accounts.spotify.com/api/token'

    let data =  {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri
    }

    const instance = axios.create({
        baseURL: 'https://accounts.spotify.com',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 
            'Authorization': Authorization
        }
      });

    instance.post('/api/token', qs.stringify(data)).then(resp => {          
        return axios({
            method: 'get',
            url: 'https://api.spotify.com/v1/me',
            headers: {
                Authorization: resp.data.token_type + ' ' + resp.data.access_token
            }
        }).then(resp => {
            if (resp.data) {
                console.log(resp.data);
                return resp.data;
            }
        }).catch(err => { console.log(err.statusCode + ' ' + err.statusMessage)})
    }).catch(err => {
        console.log(err);
    })
    
})

app.listen('8888', () => console.log('Listening on port 8888'));