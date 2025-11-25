 /*
 File containing utility functions
 */
 

 // Parse FASTA file
const parseFASTA = (text) => {
    const seqs = [];
    const lines = text.split('\n');
    let currentSeq = null;

    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('>')) {
            if (currentSeq) seqs.push(currentSeq);
            currentSeq = { header: line.substring(1), sequence: '' };
        } else if (currentSeq) {
            currentSeq.sequence += line.toUpperCase();
        }
    });
    if (currentSeq) seqs.push(currentSeq);
    return seqs;
};

// Calculate GC content
const calculateGC = (seq) => {
    const gc = (seq.match(/[GC]/g) || []).length;
    return ((gc / seq.length) * 100).toFixed(2);
};

// Calculate nucleotide composition
const getNucleotideComposition = (seq) => {
    // N represents unknown nucleotides
    const counts = { A: 0, T: 0, G: 0, C: 0, N: 0 };
    for (let base of seq) {
        if (counts.hasOwnProperty(base)) counts[base]++;
        else counts.N++;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

// Translate DNA to protein
const codonTable = {
    'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
    'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
    'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
    'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
    'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
    'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
    'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
    'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
    'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
    'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
    'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
    'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
    'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
    'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
    'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
    'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
};

const translate = (seq, frame = 0) => {
    let protein = '';
    for (let i = frame; i < seq.length - 2; i += 3) {
        const codon = seq.substring(i, i + 3);
        protein += codonTable[codon] || 'X';
    }
    return protein;
};

// Get reverse complement
const reverseComplement = (seq) => {
    const complement = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G', 'N': 'N' };
    return seq.split('').reverse().map(b => complement[b] || b).join('');
};

// Find motifs
const findMotifs = (seq, motif) => {
    const matches = [];
    const pattern = new RegExp(motif, 'gi');
    let match;
    while ((match = pattern.exec(seq)) !== null) {
        matches.push({ position: match.index, sequence: match[0] });
    }
    return matches;
};

export {
    parseFASTA,
    calculateGC,
    getNucleotideComposition,
    codonTable,
    translate,
    reverseComplement,
    findMotifs
};