var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
var Demandeconge = require('./Demandeconge');

router.get('/demandecongesid', function (req, res) 
{
    Demandeconge.getDemandeconges(req.query, function(err, rows)
    {
        if(err) 
        {
            res.status(400).json(err);
        }
        else
        {
            res.json(rows);
        }
    });
});

/*
router.post('/', function (req, res) 
{
    Conge.createConge(req.body, function(err, count){
        if(err)
        {
            res.status(400).json(err);
        }
        else
        {
            res.json(req.body);
        }
    });
});*/

module.exports = router;