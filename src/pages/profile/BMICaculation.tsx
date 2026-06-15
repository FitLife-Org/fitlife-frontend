import { useState } from 'react';

export default function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);

  const calculateBMI = () => {
    if (weight && height) {
      const heightInMeters = parseFloat(height) / 100;
      const result = parseFloat(weight) / (heightInMeters * heightInMeters);
      setBmi(parseFloat(result.toFixed(1)));
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md mx-auto my-10 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Tính chỉ số BMI</h2>
      <div className="space-y-4">
        <input 
          type="number" placeholder="Cân nặng (kg)" 
          className="w-full p-3 rounded-lg bg-gray-700 text-white"
          value={weight} onChange={(e) => setWeight(e.target.value)}
        />
        <input 
          type="number" placeholder="Chiều cao (cm)" 
          className="w-full p-3 rounded-lg bg-gray-700 text-white"
          value={height} onChange={(e) => setHeight(e.target.value)}
        />
        <button 
          onClick={calculateBMI}
          className="w-full bg-emerald-500 py-3 rounded-lg font-bold hover:bg-emerald-600 transition"
        >
          Tính ngay
        </button>
      </div>
      {bmi && (
        <div className="mt-6 text-center text-xl font-semibold text-emerald-400">
          Chỉ số BMI của bạn là: {bmi}
        </div>
      )}
    </div>
  );
}