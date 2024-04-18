const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

require('dotenv').config();

const userSchema = new Schema({
    userName: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    loginHistory: [{
        dateTime: { type: Date, default: Date.now },
        userAgent: String
    }]
});

let User;

function initialize() {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGODB);
        db.on('error', (err) => { reject(err); });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
}

function registerUser(userData) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(userData.password, 10)
            .then((hash) => {
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save()
                    .then(() => { 
                        resolve("User created"); // Resolve with success message
                    })
                    .catch((err) => {
                        if (err.code === 11000) {
                            reject("User Name already taken");
                        } else {
                            reject("There was an error creating the user: " + err);
                        }
                    });
            })
            .catch((err) => {
                reject("There was an error encrypting the password: " + err);
            });
    });
}

function checkUser(userData) {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName })
            .then((user) => {
                if (!user) {
                    reject("Unable to find user: " + userData.userName);
                } else {
                    bcrypt.compare(userData.password, user.password)
                        .then((result) => {
                            if (result) {
                                if (user.loginHistory.length === 8) {
                                    user.loginHistory.pop();
                                }
                                user.loginHistory.unshift({ dateTime: new Date().toString(), userAgent: userData.userAgent });
                                User.updateOne({ userName: user.userName }, { $set: { loginHistory: user.loginHistory } })
                                    .then(() => { resolve(user); })
                                    .catch((err) => {
                                        reject("There was an error verifying the user: " + err);
                                    });
                            } else {
                                reject("Incorrect Password for user: " + userData.userName);
                            }
                        })
                        .catch((err) => {
                            reject("Error comparing passwords: " + err);
                        });
                }
            })
            .catch((err) => {
                reject("Unable to find user: " + userData.userName);
            });
    });
}

module.exports = {
    initialize,
    registerUser,
    checkUser
};