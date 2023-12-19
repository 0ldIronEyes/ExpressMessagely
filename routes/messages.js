const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const Message = require("../models/message");
const {SECRET_KEY} = require("../config");
const ExpressError = require("../expressError");
const { ensureCorrectUser } = require("../middleware/auth");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureCorrectUser, async function (req, res, next) {
    try{
        let message = await Message.get(req.params.id);
        return res.json({message});
    }
    catch(err)
    {
        return next(err);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", async function (req,res, next) {
    try{
        let {from_username, to_username, body} = req.body;
        const message_data = await Message.create(from_username, to_username, body);
        
        return res.json({message_data})
    }
    catch(err)
    { next(err);}

})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read",ensureCorrectUser, async function (req, res, next) {
    try{
        const message = Message.get(req.params.id);
        if (message.to_user.id === req.params.id)
        {
            const read = await Message.markRead(req.params.id);
            return res.json({read});
        }
        else
        {
            throw new ExpressError("Not Allowed to mark as read", 403)
        }

    }
    catch(err)
    {
        next(err);
    }
})
