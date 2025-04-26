import express from "express";
import cloudinary from "cloudinary";
import Book from "../models/Book.model.js";
import protectRoute from "../middleware/auth.middleware.js";


const router = express.Router();


router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if(!title || !caption || !rating || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //upload image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;
    // save to database
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id, // Assuming you have user authentication middleware
    });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error uploading book:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// pagination => infinite scroll 
router.get("/", protectRoute, async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    

    const books = await Book.find()
    .sort({ createdAt: -1 })
    .skip(skip) // Skip the books for pagination
    .limit(limit) // Limit the number of books returned;
    .populate("user", "username profileImage") // Populate the user field with user data

    const totalBooks = await Book.countDocuments(); // Get the total number of books

    res.send({
      books,
      currentPage: page,
      totalBooks, 
      totalPages: Math.ceil(totalBooks / limit), // Calculate total pages
    });
  } catch (error) {
    console.log("Error fetching books:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if(!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    // Check if the user is the owner of the book
    if(book.user.toString() !== req.user._id.toString()) 
      return res.status(403).json({ message: "You are not authorized to delete this book" });

    // deleting image from cloudinary
    if(book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0]; // Extract public ID from URL
        await cloudinary.uploader.destroy(publicId); // Delete the image from Cloudinary
      } catch (error) {
        console.log("Error deleting image from cloudinary:", error);
        return res.status(500).json({ message: "Error deleting image" });
      }
    }
    await book.deleteOne();
    res.json({message: "Book deleted successfully"}); 
  } catch (error) {
    console.log("Error deleting book:", error);
    res.status(500).json({ message: "Server error" });
  }
});


//get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.log("Error fetching user's books:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;