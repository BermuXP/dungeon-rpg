var mysql = require('mysql');
require('dotenv').config(); //initialize dotenv

var connection;

var con = initializeConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    Connection: 'keep-alive'
});

module.exports = {
    getProfile,
    userExists,
    getUserBalance,
    addNewUser,
    getUserItems,
    getItem,
    getAllClasses,
    getClassById
};

function initializeConnection(config) {
    return mysql.createPool(config);
}

async function getRow(sql, whereArray, callback) {
    con.query({
        sql: sql,
        values: whereArray
    }, function (error, result, fields) {
        if (error)
            callback(error, null);
        else
            callback(null, result[0]);
    });
}

/**
 * 
 * @param {*} discordId 
 */
async function userExists(discordId, callback) {
    var sql = "SELECT `id` FROM `users` WHERE `discord_id` = ?";
    getRow(sql, [discordId], function (err, data) {
        if (err) {
            console.log("ERROR : ", err);
        } else {
            callback(data);
        }
    });
}

/**
 * 
 * @param {*} discordId 
 */
async function getUserBalance(discordId, callback) {
    var sql = "SELECT `balance` FROM `users` WHERE `discord_id` = ?";
    getRow(sql, [discordId], function (err, data) {
        if (err) {
            console.log("ERROR : ", err);
        } else {
            callback(data.balance);
        }
    });
}

async function getClassById(classId, callback) {
    var sql = 'SELECT `id`, `name`, `description` FROM `classes` WHERE `id` = ?';
    con.query(sql, [classId], function (error, results, fields) {
        if (error) {
            console.log("ERROR : ", error);
            callback(false)
        }
        return callback(results[0])
    });
}

async function getAllClasses(callback) {
    var sql = 'SELECT `id`, `name` FROM `classes`';
    con.query(sql, [], function (error, results, fields) {
        if (error) {
            console.log("ERROR : ", error);
            callback(false)
        }
        // Neat!
        return callback(results)
    });
}

async function addNewUser(discordId, callback) {
    var sql = 'INSERT INTO `users` SET discord_id = ?';
    var items = [discordId];
    con.query(sql, items, function (error, results, fields) {
        if (error) {
            console.log("ERROR : ", error);
            callback(false)
        }
        // Neat!
        return callback(results)
    });
}

async function createDugeon() {
    var sql = 'INSERT INTO `users` SET discord_id = ?';
    var items = [discordId];
    con.query(sql, items, function (error, results, fields) {
        if (error) {
            console.log("ERROR : ", error);
            callback(false)
        }
        // Neat!
        return callback(results)
    });
}


async function createParty(discordId, callback) {
    checkIfPartyExists(partyId, function(partyItem) {
        if(typeof partyItem != 'undefined') {

        }
    });
}

/**
 * 
 * @param {*} length 
 * @returns 
 */
 function makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

async function checkIfPartyExists(callback) {
    // var partyId =; 
    var sql = 'SELECT `id` FROM `player_party` WHERE `party_id` = ?';
    var items = [ makeId(20)];
    con.query(sql, items, function (error, results, fields) {
        if (error) {
            console.log("ERROR : ", error);
            callback(false)
        }
        return callback(results[0]);
    });
}


async function getItem(itemName, callback) {
    var sql = 'SELECT `name`, `rarity`, `description`, `image_url` FROM `items` WHERE `name` LIKE ? LIMIT 1';
    var items = [ "%" + itemName + "%"];
    con.query(sql, items, function (error, results, fields) {
        if (error) {
            console.log("ERROR : ", error);
            callback(false)
        }
        return callback(results[0]);
    });
}

async function getUserItems(discordId, callback) {
    var sql = 'SELECT u.id, `i`.`name`, `i`.`rarity` FROM `users` AS `u` ' +
        'LEFT JOIN `user_items` AS `ui` ON `ui`.`user_id` = `u`.`id` ' +
        'LEFT JOIN `items` AS `i` ON `i`.`id` = `ui`.`item_id` ' +
        'WHERE `u`.`discord_id` = ?';
    var items = [discordId];
    con.query(sql, items, function (error, results, fields) {
        if (error) {
            console.log("ERROR : ", error);
            callback(false)
        }
        return callback(results);
    });
}


async function getUserItems2(discordId, callback) {
    var sql = 'SELECT `ui`.`id` FROM `users` AS `u` ' +
        'LEFT JOIN `user_items` AS `ui` ON `ui`.`user_id` = `u`.`id` ' +
        'WHERE `u`.`discord_id` = ?';
    var items = [discordId];
    con.query(sql, items, function (error, results, fields) {
        if (error) {
            console.log("ERROR : ", error);
            callback(false)
        }
        if (typeof results != 'undefined') {
            var sqlSecond = "SELECT `rarity`, `name` FROM `items` WHERE `id` = ?";
            con.query(sqlSecond, [results[0].id], function (errorsSecond, otherResult, fieldsSecond) {
                if (error) {
                    console.log("ERROR : ", errorsSecond);
                    callback(false)
                }
                console.log(otherResult)
                // Neat!
                return
            });
        }
    });
}



async function getProfile(commandName, callback) {
    var sql = "";
    getRows(sql, [commandName], function (err, data) {
        if (err) {
            console.log("ERROR : ", err);
        } else {
            callback(data);
        }
    });
}