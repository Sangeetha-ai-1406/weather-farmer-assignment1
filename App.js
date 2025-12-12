import React, {useState} from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function App(){
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const backend = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  async function search(e){
    e && e.preventDefault();
    if (!q) return;
    setLoading(true);
    try{
      const res = await fetch(`${backend}/api/weather?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (res.ok) setData(json);
      else alert(json.error || 'Failed');
    }catch(err){
      alert('Error: '+err.message);
    } finally { setLoading(false); }
  }

  const chart = data ? {
    labels: data.forecast.slice(0,10).map(f=>f.dt_txt.replace(' ','\n')),
    datasets: [
      { label: 'Temp (°C)', data: data.forecast.slice(0,10).map(f=>f.temp), tension:0.3, yAxisID:'y' },
      { label: 'Rain POP (%)', data: data.forecast.slice(0,10).map(f=>f.pop), tension:0.3, yAxisID:'y1' }
    ]
  } : null;

  const options = {
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: { type:'linear', position:'left' },
      y1: { type:'linear', position:'right', grid: { drawOnChartArea: false } }
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Weather Advisory — Farmers</h1>
        <small>Simple MERN assignment</small>
      </div>

      <form onSubmit={search} style={{marginTop:12}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Enter city (e.g. Pune,IN)" style={{padding:8, width:300}}/>
        <button disabled={loading} style={{marginLeft:8, padding:'8px 12px'}}>Search</button>
      </form>

      {data && (
        <>
          <div style={{marginTop:16}}>
            <div style={{display:'flex', gap:12}}>
              <div className="card" style={{flex:1}}>
                <h3>{data.location.name}, {data.location.country}</h3>
                <p><strong>Temp:</strong> {data.current.temp} °C</p>
                <p><strong>Humidity:</strong> {data.current.humidity}%</p>
                <p><strong>Wind:</strong> {data.current.wind_speed} km/h</p>
              </div>
              <div className="card" style={{flex:1}}>
                <h4>Advisories</h4>
                {data.advisories.length===0 && <p>No advisories generated.</p>}
                {data.advisories.map((a,i)=>(
                  <div key={i} className="advisory">{a}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={{marginTop:18}}>
            <h4>Short-term forecast (first 10 blocks)</h4>
            {chart && <Line data={chart} options={options} />}
          </div>
        </>
      )}

      <footer style={{marginTop:20,fontSize:13,color:'#555'}}>Notes: This app fetches OpenWeatherMap forecast. Add your API key to the server .env and run both server and client.</footer>
    </div>
  );
}

export default App;
