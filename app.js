
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

const app = express();
app.use(express.json());

// Frontend — do not modify dist/Frontend
app.use(express.static(path.join(__dirname, 'dist/Frontend')));

// MongoDB Atlas — credentials are stored in .env
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log('MongoDB connection error:', err.message));

// Employee schema
const employeeSchema = new mongoose.Schema({
    name: String,
    designation: String,
    position: String,
    location: String,
    salary: mongoose.Schema.Types.Mixed
});

const Employee = mongoose.model('Employee', employeeSchema);

// GET: all employees
app.get('/api/employeelist', async (req, res) => {
    try {
        res.json(await Employee.find());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: one employee
app.get('/api/employeelist/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (err) {
        res.status(400).json({ message: 'Invalid employee ID' });
    }
});

// POST: add employee
app.post('/api/employeelist', async (req, res) => {
    try {
        const employee = await Employee.create(req.body);
        res.status(201).json(employee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT: update employee
async function updateEmployee(req, res) {
    try {
        const id = req.params.id || req.body._id;

        if (!id) {
            return res.status(400).json({ message: 'Employee ID is required' });
        }

        const employee = await Employee.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

app.put('/api/employeelist', updateEmployee);
app.put('/api/employeelist/:id', updateEmployee);

// DELETE: one employee
app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Invalid employee ID' });
    }
});

// Frontend fallback — keep frontend files unchanged
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/Frontend/index.html'));
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
