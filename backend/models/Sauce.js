const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    // id: {type: ObjectId, required:true, unique:true},
    name: { type: String, required: true},
    userId: { type: String, required: true},
    manufacturer: { type: String, required: true}, // me suis perdu avec ce que signifie unique
    description: { type: String, required: true},
    mainPepper: { type: String, required: true},
    imageUrl: { type: String, required: true},
    heat: { type: Number, required: true},
    likes: { type: Number, default: 0},
    dislikes: { type: Number, default: 0},
    usersLiked: [{ type: String }],
    usersDisliked: [{ type: String }],
});

module.exports = mongoose.model('sauce', sauceSchema);