const router = require("express").Router();

router.use(require("./getVideos"));
router.use(require("./getVideo"));

module.exports = router;
