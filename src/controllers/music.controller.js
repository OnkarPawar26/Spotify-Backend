const musicModel = require("../models/music.model");
const albumModel = require("../models/album.model")
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../services/storage.service");
const { get } = require("mongoose");

async function createMusic(req, res) {



  const { title } = req.body;
  const file = req.file;

  const result = await uploadFile(file.buffer.toString("base64"));

  const music = await musicModel.create({
    uri: result.url,
    title,
    artist: req.user.id,
  });

  res.status(201).json({
    message: "Music created successfully",
    music: {
      id: music._id,
      uri: music.uri,
      title: music.title,
      artist: music.artist,
    },
  });
}

async function createAlbum(req, res) {

  const { title, musicId } = req.body;

  const album = await albumModel.create({
    title,
    artist: req.user.id,
    musics: musicId,
  })

  res.status(201).json({
    message: "Album Created Successfully",
    album: {
      id: album._id,
      title: album.title,
      artist: album.artist,
      musics: album.musics
    }
  })
}

async function getAllMusic(req, res) {

  const musics = await musicModel
  .find()
  .skip(1) //set the number of musics to skip (for pagination)
  .limit(10)
  .populate('artist', ['username'])

  res.status(200).json({
    message: "Music feteched successfully",
    musics: musics
  })
}

async function getAllAlbums(req, res) {

  const albums = await albumModel.find().select("title artist ").populate("artist", "musics username")

  res.status(200).json({
    message: "Albums feteched successfully",
    albums: albums
  })
}

async function getAlbumById(req, res) {

  const albumId = req.params.albumId;

  const album = await albumModel.findById(albumId).populate("artist","username").populate('musics')

  return res.status(200).json({
    message: "Album fetched successfully",
    album: album,
  })
}


module.exports = { createMusic, createAlbum, getAllMusic, getAllAlbums, getAlbumById };
