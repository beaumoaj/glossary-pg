const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { database } = require("./db");
const bcrypt = require("bcrypt");

const DBG = 0;
function debug(message) {
    if (DBG) {
        console.log(message);
    }
}

const USE_AUTH = 1;
if (process.env.USE_AUTH === 'false') {
    USE_AUTH = 0;
    console.log("Authentication is turned off");
}

function generateAccessToken(username) {
    // token expires in 1 hour (3600 seconds)
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '3600s' });
}

function authenticateToken(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (USE_AUTH) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        debug(`auth token=${token}`);
        
        if (token == null) {
            return res.status(401).json({error:"401", message:"No auth token provided"});
        }
        
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            debug(err)
            
            if (err) {
                return res.status(403).json({error:"403", message:"Auth token not valid"});
            }
            
            req.user = user
            
            next()
        })
    } else {
        next();
    }
}

const saltRounds = 10;

const router = new Router();

router.post("/terms/add", authenticateToken, function (req, res) {
    const term = req.body.term;
    const def = req.body.definition;
    const contrib = req.body.contributorId;

    const query =
        "INSERT INTO terms (term, definition, contributor_id) VALUES ($1, $2, $3) RETURNING id";
    
    database
        .query(query, [term, def, contrib])
        .then((result) => res.json({message: "Term added", id: result.rows[0].id}))
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

router.post("/terms/update", authenticateToken, function (req, res) {
    const termid = req.body.termid;
    const term = req.body.term;
    const def = req.body.definition;
    const contrib = req.body.contributorId;

    const query =
          "UPDATE terms set term=$1, definition=$2, contributor_id=$3 WHERE id=$4";
    
    database
        .query(query, [term, def, contrib, termid])
        .then((result) => {
            debug(result);
            if (result.rowCount === 0) {
                res.json({message: "Error.  Term not updated"})
            } else {
                res.json({message: "Term updated"})
            }
        })
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

router.post("/terms/delete1", function (req, res) {
    const termid = req.body.termid;
    
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const r = {};
    // const query = "DELETE from term_resources where termid = $1"
    const query = "WITH deleted AS (DELETE FROM term_resources WHERE termid = $1 RETURNING *) SELECT count(*) AS dcount FROM deleted";
    database
        .query(query, [termid])
        .then((result) => {
            debug(result);
            // r['resources'] = `${result.rows[0].deleted} Resources deleted.`;
            r['resources'] = `${result.rowCount} ${result.rows[0].dcount} Resources deleted.`;
            // const query2 = "DELETE from terms WHERE id = $1";
            const query2 = "WITH deleted AS (DELETE from terms WHERE id = $1  RETURNING *) SELECT count(*) as dcount FROM deleted";
            database
                .query(query2,[termid])
                .then((result2) => {
                    r['term'] = `${result2.rowCount} ${result2.rows[0].dcount} term deleted`;
                    res.json({message: `${r.resources} ${r.term}`});
                })
                .catch((e) => {
                    console.error(e);
                    res.json({error: `Error in inner query ${query2}`});
                });
        })
        .catch((e) => {
            console.error(e);
            res.json({error: `Error in outer query ${query}`});
        });
});

router.post("/terms/delete", authenticateToken, function (req, res) {
    const termid = req.body.termid;

    const query2 = "DELETE from term_resources where termid = $1"

    const query =
          "DELETE from terms WHERE id = $1";
    
    database
        .query(query, [termid])
        .then((result) => {
            debug(result);
            if (result.rowCount === 0) {
                res.json({message: "Error.  Term not deleted"})
            } else {
                res.json({message: "Term deleted"})
            }
        })
        .catch((e) => {
            console.error(e);
            res.json({error: e});
        });
});

router.post("/terms/resources/add", authenticateToken, function (req, res) {
    const termid = req.body.termid;
    const link = req.body.link;  
    const linktype = req.body.linktype; // video or web
    const language = req.body.language;

    const query =
          "INSERT INTO term_resources (termid, link, linktype, language) VALUES ($1,$2,$3,$4) RETURNING id";
    
    database
        .query(query, [termid, link, linktype, language])
        .then((result) => res.json({message: "Term resource added", id: result.rows[0].id}))
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

router.post("/terms/resources/update", authenticateToken, function (req, res) {
    const res_id = req.body.resourceid;
    const termid = req.body.termid;
    const link = req.body.link;
    const linktype = req.body.linktype;
    const language = req.body.language;

    const query =
          "UPDATE term_resources set termid=$1, link=$2, linktype=$3, language=$4 where id=$5";
    
    database
        .query(query, [termid, link, linktype, language, res_id])
        .then((result) => {
            if (result.rowCount === 0) {
                res.json({message: "Error.  Term resource not updated"})
            } else {
                res.json({message: "Term resource updated"})
            }
        })
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

router.post("/terms/resources/delete", authenticateToken, function (req, res) {
    const res_id = req.body.resourceid;

    const query =
          "DELETE from term_resources where id = $1";
    
    database
        .query(query, [res_id])
        .then((result) => {
            if (result.rowCount === 0) {
                res.json({message: "Error.  Term resource not deleted"})
            } else {
                res.json({message: "Term resource deleted"})
            }
        })
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

router.post("/terms/term", function (req, res) {
    const termid = req.body.termid;
    
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // const query = "SELECT terms.id, terms.term, terms.definition, json_agg(json_build_object('resid',term_resources.termid, 'link',term_resources.link,'type',term_resources.linktype, 'language',term_resources.language)) as resources FROM terms LEFT JOIN term_resources ON terms.id = $1 AND terms.id = term_resources.termid GROUP BY terms.id";

    const query = "SELECT id, term, definition FROM terms where id = $1";
    database
        .query(query, [termid])
        .then((result) => {
            debug(result);
            if (result.rowCount === 0) {
                res.json([]);
            } else {
                const data = result.rows[0];
                const obj = {
                    'termid':data.id,
                    'term' : data.term,
                    'definition' : data.definition,
                    'resources':[]
                };
                debug(obj);
                const query2 = "SELECT json_build_object('resid',id, 'link',link,'type',linktype, 'language',language) as resources FROM term_resources where termid = $1";
                database
                    .query(query2,[termid])
                    .then((result2) => {
                        if (result2.rowCount > 0) {
                            result2.rows.forEach((r) => {
                                obj.resources.push(r.resources);
                            });
                        }
                        res.json(obj);
                    })
            }
        })
        .catch((e) => {
            console.error(e);
            res.json({error: e});
        });
});

router.get("/terms", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const query = "SELECT id, term, definition FROM terms";
    database
        .query(query)
        .then((result) => {
            debug(result);
            if (result.rowCount === 0) {
                res.json([]);
            } else {
                debug(result);
                res.json(result.rows);
            }
        })
        .catch((e) => {
            console.error(e);
            res.json({error: e});
        });
});

router.post("/term/resources", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const termid = req.body.termid;
    const query = "SELECT id, link, linktype, language FROM term_resources where termid = $1";
    database
        .query(query,[termid])
        // .query(query)
        .then((result) => {
            debug(result);
            if (result.rowCount === 0) {
                res.json([]);
            } else {
                debug(result);
                res.json(result.rows);
            }
        })
        .catch((e) => {
            console.error(e);
            res.json({error: e});
        });
});

router.get("/contributors", authenticateToken, function (req, res) {
    database.query("SELECT id, contributor_name, email, region FROM contributors")
        .then((result) => {
            if (result.rowCount === 0) {
                res.json({message: "no contributors !!!"});
            } else {
                debug(result);
                res.json(result.rows);
            }
        })
        .catch((e) => {
            console.error(e);
            res.json({error: e});
        });
});

router.post("/contributor/login", async function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const email = req.body.email;
    
    const query =
          "SELECT id, password from contributors where email = $1";

    database
        .query(query, [email])
        .then((result) => {
            // await bcrypt.compare(password, hash);
            debug(result);
            if (result.rowCount === 0) {
                res.json({message: "Incorrect Email"});
            } else {
                (async () => {
                    // Hash fetched from DB
                    const hash = result.rows[0].password;
                    const userId = result.rows[0].id;

                    // Check if password is correct
                    const isValidPass = await bcrypt.compare(req.body.password, hash);

                    if (isValidPass) {
                        debug(`user with id ${userId} is authenticated`);
                        const token = generateAccessToken({ username: req.body.email });
                        res.json({auth:token, userid:userId});
                    } else {
                        res.json({message: "Incorrect Password"});
                    }
                })();
            }
        })
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

router.post("/newContributor", authenticateToken, async function (req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const region = req.body.region;
    const pass = await bcrypt.hash(req.body.password, saltRounds)

    debug(`password is ${pass}`);

    const query =
          "INSERT INTO contributors (contributor_name, region, email, password) VALUES ($1,$2,$3,$4) RETURNING id";
    
    database
        .query(query, [name, region, email, pass])
        .then((result) => res.json({message: "Contributor added", id: result.rows[0].id}))
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

// req is the Request object, res is the Response object
// (these are just variable names, they can be anything but it's a convention to call them req and res)
router.get("/", function (req, res) {
  res.send("Glossary Server v1.0");
});

module.exports = router;
