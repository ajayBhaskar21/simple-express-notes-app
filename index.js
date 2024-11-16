const express = require('express');
const mongoose = require('mongoose')
const app = express();
const PORT = 5001;

// Middleware
app.use(express.json()); // Parses JSON bodies
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public')); // Serves static files from the 'public' directory

app.set('view engine', 'ejs')

// database connection
mongoose.connect('mongodb://localhost:27017/NotesApp')
    .then(() => console.log('Connected to the notes database'))
    .catch((e) => console.log(e));

// mongodb schema
const notesschema = mongoose.Schema({
    
    notesName: {type : String, required : true, unique : true},
    notesContent: {type : String}
        
})

const Note = mongoose.model('Note', notesschema)

// Routes
app.get('/', (req, res) => {
    res.send('empty route');
});


app.get('/addNote', (req, res) => {
    res.render('addNote');
});


app.post('/addNotes', (req, res) => {
    let notesName = req.body['notesName']
    let notesContent = req.body['notesContent']
    const newNote = new Note({
        notesName: notesName,
        notesContent: notesContent
    
    })
    newNote.save()
        .then(() => res.redirect('displayNotes'))
        .catch((e) => res.status(500).json('error storing data : ' + e))
    
});

app.get('/displayNotes', async (req, res) => {
    try {
        let notes = await Note.find(); // Fetch notes from MongoDB
        res.render('displayNotes', { notes }); // Pass the notes to the EJS template
    } catch (e) {
        res.status(500).json('Error: ' + e); // Error handling
    }
});


app.get('/updateNote/:notesName', async (req, res) => {
    try {
        let notes = await Note.findOne({ notesName: req.params.notesName });

        if (!notes) {
            return res.status(404).json('Note not found');
        }

        res.render('updateNote', { notes });
    } catch (e) {
        res.status(500).json('Error: ' + e);
    }
});


app.post('/updateNote/:notesName', async (req, res) => {
    try {
        // Update the note with the new notesName and notesContent
        let updatedNote = await Note.findOneAndUpdate(
            { notesName: req.params.notesName },  // Find the note by notesName
            {
                notesName: req.body.notesName,  // Update notesName
                notesContent: req.body.notesContent  // Update notesContent
            },
            { new: true }  // Return the updated document
        );

        // Redirect to displayNotes page after successful update
        res.redirect('/displayNotes');
    } catch (e) {
        res.status(500).json('Error updating note: ' + e); // Error handling
    }
});

app.get('/deleteNote/:notesName', async (req, res) => {
    try {
        let notes = await Note.deleteOne({ notesName: req.params.notesName }); // Fetch note by notesName
        res.redirect('/displayNotes')
    } catch (e) {
        res.status(500).json('Error: ' + e); // Error handling
    }
});

app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});
