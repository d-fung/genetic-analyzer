# [Genetic Sequence Analyzer](https://d-fung.github.io/genetic-analyzer) 🧬

### Try it here: https://d-fung.github.io/genetic-analyzer

A powerful web-based bioinformatics tool for analyzing DNA sequences from FASTA files. Built with React to provide real-time sequence analysis, visualization, and protein translation capabilities—all running entirely in your browser.

![React](https://img.shields.io/badge/React-19.2.0-blue) ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38bdf8) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Core Analysis
- **FASTA File Parser** - Upload and parse single or multiple DNA sequences
- **Sequence Statistics** - Instant calculation of length, GC content, and molecular weight
- **Nucleotide Composition** - Interactive pie chart showing A, T, G, C distribution
- **Codon Usage Analysis** - Bar chart of the top 10 most frequent codons

### Advanced Tools
- **Interactive Sequence Viewer** - Color-coded nucleotide display with position tracking
  - Adenine (A) in blue
  - Thymine (T) in red  
  - Guanine (G) in yellow
  - Cytosine (C) in green
- **Motif Search & Highlighting** - Find DNA patterns using regex with position highlighting
- **6-Frame Protein Translation** - Translate DNA to protein in all reading frames (+1, +2, +3, -1, -2, -3)
- **Reverse Complement Calculator** - Automatic reverse strand computation
- **JSON Export** - Download complete analysis results

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm installed

### Installation

1. **Clone and navigate:**
```bash
git clone https://github.com/d-fung/genetic-analyzer.git
cd genetic-analyzer
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm start
```

Opens at `http://localhost:3000` 🎉

## 📁 Project Structure

```
genetic-analyzer/
├── src/
│   ├── App.js                 # Main React component
│   ├── index.js               # Application entry point
│   ├── index.css              # Global styles + Tailwind
│   └── utils/
│       └── sequenceUtils.js   # Sequence analysis utilities
├── public/
│   └── index.html             # HTML template
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
└── package.json               # Dependencies
```

## 🧬 Usage Guide

### Upload & Analyze
1. Click **"Upload FASTA"** button
2. Select your `.fasta`, `.fa`, `.fna`, or `.txt` file
3. Sequences are automatically parsed and analyzed

### Multiple Sequences
- Use the dropdown to switch between sequences in multi-FASTA files
- Each sequence analyzed independently

### Motif Search
- Enter DNA patterns (e.g., `ATG` for start codons)
- Use regex for advanced searches (e.g., `TATA.*` for TATA box variants)
- Matches highlighted in sequence viewer with positions listed

### Export Results
- Click **"Export Analysis (JSON)"** to download
- Includes all statistics, translations, and motif matches

## 🧪 Sample Data

Try the sample_FASTA.txt file included in this repo by clicking the ***Use Demo*** Button

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19.2.0 | UI framework |
| Recharts 3.4.1 | Data visualization |
| Lucide React 0.554.0 | Icon library |
| Tailwind CSS 3.3.0 | Styling |
| JavaScript ES6+ | Core logic |

## 🧮 Key Algorithms

### GC Content
```
GC% = (Count of G + Count of C) / Total bases × 100
```

### Genetic Code Translation
Standard codon table with all 64 codons mapping to 20 amino acids plus stop codons.

### Reverse Complement
```
Input:  5'-ATGC-3'
Output: 5'-GCAT-3' (reverse of complement strand)
```