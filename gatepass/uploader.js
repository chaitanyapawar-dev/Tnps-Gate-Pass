//File upload
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,"./uploads");
    },
    filename: function (req, file, cb){
        return cb(null,`${Date.now()}-${file.originalname}`);
    },
});


    


const uploadFile  = multer({storage: storage})


module.exports = uploadFile;