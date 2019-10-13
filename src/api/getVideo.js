const router = require("express").Router();
const axios = require("axios");
const { celebrate, Joi } = require("celebrate");
const { apiKey } = require("../config");
const { ApiError } = require("../helpers/errors");
const { cache } = require("../helpers/middleware/cache");

router.get(
  "/video/:videoId",
  cache,
  celebrate({
    params: Joi.object()
      .keys({
        videoId: Joi.string().required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { videoId } = req.params;

    const url1 = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&key=${apiKey}&id=${videoId}`;

    try {
      const response1 = await axios.get(url1);

      if (!response1 || response1.data.items.length === 0)
        throw new ApiError(`Couldn't find video`, 404);

      const { channelId } = response1.data.items[0].snippet;

      const url2 = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&key=${apiKey}&id=${channelId}`;

      const response2 = await axios.get(url2);

      if (!response2 || response2.data.items.length === 0)
        throw new ApiError(`Couldn't find video`, 404);

      res.json({
        videoId,
        videoTitle: response1.data.items[0].snippet.title,
        videoDescription: response1.data.items[0].snippet.description,
        channelTitle: response1.data.items[0].snippet.channelTitle,
        videoViewCount: response1.data.items[0].statistics.viewCount,
        videoLikeCount: response1.data.items[0].statistics.likeCount,
        videoDislikeCount: response1.data.items[0].statistics.dislikeCount,
        publishedAt: response1.data.items[0].snippet.publishedAt,
        channelCreationDate: response2.data.items[0].snippet.publishedAt,
        channelThumbnail:
          response2.data.items[0].snippet.thumbnails.default.url,
        channelViewCount: response2.data.items[0].statistics.viewCount,
        channelSubscriberCount:
          response2.data.items[0].statistics.subscriberCount,
        channelVideoCount: response2.data.items[0].statistics.videoCount
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
