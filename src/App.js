import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Upload, Download, Search, Dna, Activity, FileText } from 'lucide-react';
import { parseFASTA, calculateGC, getNucleotideComposition, codonTable, translate, reverseComplement, findMotifs } from './utils/sequenceUtils';

const GeneticVizPlatform = () => {
  const [sequences, setSequences] = useState([]);
  const [selectedSeq, setSelectedSeq] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [motifSearch, setMotifSearch] = useState('');
  const [motifMatches, setMotifMatches] = useState([]);
  const fileInputRef = useRef(null);


  // Analyze sequence
  const analyzeSequence = (seq) => {
    const sequence = seq.sequence;
    const gcContent = calculateGC(sequence);
    const composition = getNucleotideComposition(sequence);
    
    // Get all 6 reading frames
    const frames = [
      { frame: '+1', protein: translate(sequence, 0) },
      { frame: '+2', protein: translate(sequence, 1) },
      { frame: '+3', protein: translate(sequence, 2) },
    ];
    
    const revComp = reverseComplement(sequence);
    frames.push(
      { frame: '-1', protein: translate(revComp, 0) },
      { frame: '-2', protein: translate(revComp, 1) },
      { frame: '-3', protein: translate(revComp, 2) }
    );

    // Codon usage
    // Skips codons in one reading frame onl, and skips overlapping codons at positions 1 or 2
    const codonUsage = {};
    for (let i = 0; i < sequence.length - 2; i += 3) {
      const codon = sequence.substring(i, i + 3);
      if (codon.length === 3) {
        codonUsage[codon] = (codonUsage[codon] || 0) + 1;
      }
    }
    const topCodons = Object.entries(codonUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    return {
      length: sequence.length,
      gcContent,
      composition,
      frames,
      topCodons,
      molecularWeight: (sequence.length * 325).toFixed(2)
    };
  };


  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const parsed = parseFASTA(event.target.result);
        setSequences(parsed);
        if (parsed.length > 0) {
          setSelectedSeq(parsed[0]);
          setAnalysis(analyzeSequence(parsed[0]));
        }
      };
      reader.readAsText(file);
    }
  };

  // Load demo file
  const loadDemoFile = async () => {
    console.log('Demo button clicked!');
    try {
      console.log('Fetching file...');
      const response = await fetch(`${process.env.PUBLIC_URL}/sample_FASTA.txt`);
      if (!response.ok) {
        throw new Error(`Failed to fetch demo file: ${response.status}`);
      }
      const text = await response.text();
      console.log('Text loaded:', text.substring(0, 200));
      const parsed = parseFASTA(text);
      setSequences(parsed);
      if (parsed.length > 0) {
        setSelectedSeq(parsed[0]);
        setAnalysis(analyzeSequence(parsed[0]));
      }
    } catch (error) {
      console.error('Error loading demo file:', error);
      alert('Could not load demo file. Please make sure sample_FASTA.txt is in the public folder.');
    }
  };

  // Search motifs
  const handleMotifSearch = () => {
    if (selectedSeq && motifSearch) {
      const matches = findMotifs(selectedSeq.sequence, motifSearch);
      setMotifMatches(matches);
    }
  };

  // Export analysis
  const exportAnalysis = () => {
    const data = {
      sequence: selectedSeq,
      analysis: analysis,
      motifs: motifMatches
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_${selectedSeq.header.substring(0, 20)}.json`;
    a.click();
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dna className="w-10 h-10 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Genetic Sequence Analyzer</h1>
                <p className="text-gray-600">Upload FASTA files for comprehensive sequence analysis</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                <Upload className="w-5 h-5" />
                Upload FASTA
              </button>
              <button
                onClick={loadDemoFile}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                <Dna className="w-5 h-5" />
                Use Demo
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".fasta,.fa,.fna,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {sequences.length > 0 && (
          <>
            {/* Sequence Selector */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Sequence:</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={sequences.indexOf(selectedSeq)}
                onChange={(e) => {
                  const seq = sequences[e.target.value];
                  setSelectedSeq(seq);
                  setAnalysis(analyzeSequence(seq));
                  setMotifMatches([]);
                }}
              >
                {sequences.map((seq, idx) => (
                  <option key={idx} value={idx}>{seq.header}</option>
                ))}
              </select>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Length</p>
                    <p className="text-2xl font-bold text-indigo-600">{analysis.length}</p>
                  </div>
                  <Activity className="w-8 h-8 text-indigo-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">GC Content</p>
                    <p className="text-2xl font-bold text-green-600">{analysis.gcContent}%</p>
                  </div>
                  <Dna className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mol. Weight</p>
                    <p className="text-2xl font-bold text-purple-600">{analysis.molecularWeight}</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Motifs Found</p>
                    <p className="text-2xl font-bold text-orange-600">{motifMatches.length}</p>
                  </div>
                  <Search className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Motif Search */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Motif Search</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter motif (e.g., ATG, TATA.*)"
                  value={motifSearch}
                  onChange={(e) => setMotifSearch(e.target.value.toUpperCase())}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleMotifSearch}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Search
                </button>
              </div>
              {motifMatches.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700 mb-2">Found {motifMatches.length} matches:</p>
                  <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-3">
                    {motifMatches.map((match, idx) => (
                      <div key={idx} className="text-sm text-gray-600 mb-1">
                        Position {match.position}: <span className="font-mono bg-yellow-200 px-1">{match.sequence}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sequence Viewer */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Sequence Viewer</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">
                {selectedSeq.sequence.match(/.{1,60}/g).map((line, idx) => (
                  <div key={idx} className="mb-1">
                    <span className="text-gray-500 mr-2">{(idx * 60).toString().padStart(6, '0')}</span>
                    {line.split('').map((base, baseIdx) => {
                      const pos = idx * 60 + baseIdx;
                      const isMotif = motifMatches.some(m => 
                        pos >= m.position && pos < m.position + m.sequence.length
                      );
                      const color = base === 'A' ? 'text-blue-400' : 
                                    base === 'T' ? 'text-red-400' : 
                                    base === 'G' ? 'text-yellow-400' : 
                                    base === 'C' ? 'text-green-400' : 'text-gray-400';
                      return (
                        <span key={baseIdx} className={`${color} ${isMotif ? 'bg-yellow-600' : ''}`}>
                          {base}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Nucleotide Composition */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Nucleotide Composition</h2>
                <PieChart width={400} height={300}>
                  <Pie
                    data={analysis.composition}
                    cx={200}
                    cy={150}
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analysis.composition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>

              {/* Top Codons */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Top 10 Codon Usage</h2>
                <BarChart width={400} height={300} data={analysis.topCodons}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name"
                    interval={0}
                    angle={-45}
                    textAchor="end"
                   />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </div>
            </div>

            {/* Reading Frames */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Protein Translation (6 Reading Frames)</h2>
              <div className="space-y-3">
                {analysis.frames.map((frame, idx) => (
                  <div key={idx} className="border border-gray-200 rounded p-3">
                    <div className="font-medium text-gray-700 mb-2">{frame.frame}</div>
                    <div className="bg-gray-50 p-2 rounded font-mono text-xs overflow-x-auto whitespace-nowrap">
                      {frame.protein}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <button
                onClick={exportAnalysis}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-5 h-5" />
                Export Analysis (JSON)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GeneticVizPlatform;