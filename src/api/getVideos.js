const router = require("express").Router();
const axios = require("axios");
const { celebrate, Joi } = require("celebrate");
const { apiKey } = require("../config");
const { ApiError } = require("../helpers/errors");
const { cache } = require("../helpers/middleware/cache");

router.get(
  "/videos/:videos",
  cache,
  celebrate({
    params: Joi.object()
      .keys({
        videos: Joi.string().required()
      })
      .required(),
    query: Joi.object()
      .keys({
        q: Joi.string()
          .min(1)
          .required(),
        token: Joi.string()
          .min(1)
          .optional()
      })
      .required()
  }),
  async (req, res, next) => {
    const q = req.query.q.split(" ").join("+");
    const { token } = req.query;
    const url1 = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&order=relevance&type=video&q=${q}${
      token ? `&pageToken=${token}` : ""
    }&key=${apiKey}`;

    try {
      const response1 = await axios.get(url1);

      if (!response1 || response1.data.items.length === 0)
        throw new ApiError(`Couldn't find results`, 404);

      const videoIds = response1.data.items
        .map(item => item.id.videoId)
        .join(",");

      const url2 = `https://www.googleapis.com/youtube/v3/videos?part=statistics&key=${apiKey}&id=${videoIds}`;
      const response2 = await axios.get(url2);

      if (!response2 || response2.data.items.length === 0)
        throw new ApiError(`Couldn't find results`, 404);

      const { totalResults } = response1.data.pageInfo;
      const { nextPageToken } = response1.data;
      const videos = response1.data.items.map((item, index) => ({
        videoId: item.id.videoId,
        videoTitle: item.snippet.title,
        videoThumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        viewCount: response2.data.items[index].statistics.viewCount,
        likeCount: response2.data.items[index].statistics.likeCount,
        dislikeCount: response2.data.items[index].statistics.dislikeCount,
        commentCount: response2.data.items[index].statistics.commentCount,
        publishedAt: item.snippet.publishedAt
      }));

      res.json({ totalResults, nextPageToken, videos });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
