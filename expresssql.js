const express = require('express');
const { message } = require('statuses');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());

const db = new sqlite3.Database('./itemsdb.sqlite', (err) => {
    if(err) {
        console.err('Deu erro!');
    } else {
        console.log('Deu certo!');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    descricao TEXT,
    dataCriacao TEXT DEFAULT CURRENT_TIMESTAMP)`, (err) => {
        if (err) {
            console.error('Deu erro ao criar a tabela');
        }
});

app.post('/items', (req, res) => {
    const { name, descricao } = req.body;
    const query = INSERT INTO items (name, descricao) VALUES (?, ?);

    db.run(query, [name, descricao], (err) => {
        if(err) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(201).json({id: this.lastID, name, descricao });
        }
    })
});

app.get('/items', (req, res) => {
    const query = SELECT * FROM items;
    db.run(query, [], (err, rows) => {
        if (err) {
            console.error({ message: err.message});
        } else {
            res.status(200).json(rows);
        }
    });
});

app.get('/items/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM items WHERE id = ?';

    db.get(query, [id], (err, row) => {
        if (err) {
            res.status(500).json({ message: err.message });
        } else if (!row) {
            res.status(404).json({ message: 'Não achou' });
        } else {
            res.status(200).json(row);
        }
    });
});

app.put('/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, descricao } = req.body;
    const query = 'UPDATE items SET name = ?, descricao = ? WHERE id = ?';

    db.run(query, [name, descricao, id], function (err) {
        if (err) {
            res.status(400).json({ message: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: 'Item não encontrado' });
        } else {
            res.status(200).json({ id, name, descricao });
        }
    });
});

app.patch('/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, descricao } = req.body;
    const query = 'UPDATE items SET name = COALESCE(?, name), descricao = COALESCE(?, descricao) WHERE id = ?';

    db.run(query, [name, descricao, id], function (err) {
        if (err) {
            res.status(400).json({ message: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: 'Item não encontrado' });
        } else {
            res.status(200).json({ id, name: name || undefined, descricao: descricao || undefined });
        }
    });
});

app.delete('/items/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM items WHERE id = ?';

    db.run(query, [id], function (err) {
        if (err) {
            res.status(400).json({ message: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: 'Item não encontrado' });
        } else {
            res.status(200).json({ message: 'Item deletado com sucesso' });
        }
    });
});

app.listen(port, () => {
    console.log("servidor rodando em http://localhost:3000");
});