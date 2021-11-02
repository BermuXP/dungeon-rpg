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
    getUserItems
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
    var sql = "SELECT * FROM `users` WHERE `discord_id` = ?";
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
        if(typeof results != 'undefined') {
            var sqlSecond = "SELECT `rarity`, `name` FROM `items` WHERE `id` = ?"; 
            con.query(sqlSecond,  [results[0].id], function (errorsSecond, otherResult, fieldsSecond) {
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