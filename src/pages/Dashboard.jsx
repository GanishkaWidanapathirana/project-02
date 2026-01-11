import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'symmetry',
      title: 'Symmetry Detection',
      description: 'Arrange objects to match your internal sense of balance.',
      color: 'var(--info)',
      bgColor: '#E6F0FA', // Light blue bg
      path: '/symmetry'
    },
    {
      id: 'cleaning',
      title: 'Contamination Check',
      description: 'Identify and clean dirt spots using spray and wipe tools.',
      color: '#2e5c28',
      bgColor: 'var(--success)', // Light green bg
      path: '/cleaning'
    },
    {
      id: 'checking',
      title: 'Checking & Rechecking',
      description: 'Secure household items to detect checking behavior patterns.',
      color: '#FF6B6B', // Warm red/coral color for alert/checking theme
      bgColor: '#FFF5F5', // Light red/pink background
      path: '/checking'
    },
    {
      id: 'intrusive-thoughts',
      title: 'Intrusive Thoughts & Cognitive Interpretation',
      description: 'Assess cognitive distortions through scenario-based questions.',
      color: '#FF6B6B', // Coral/red for cognitive/thought patterns
      bgColor: '#FFF5F5', // Light red/pink background
      path: '/intrusive-thoughts'
    }
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>OCD Assessment Dashboard</h1>
        <p style={styles.subtitle}>Select a module to begin your session</p>
      </header>

      <div style={styles.grid}>
        {games.map((game) => (
          <div 
            key={game.id} 
            style={{...styles.card, backgroundColor: game.bgColor}}
            onClick={() => game.path !== '#' && navigate(game.path)}
          >
            <div style={styles.cardHeader}>
              <h3 style={{...styles.cardTitle, color: game.color}}>{game.title}</h3>
            </div>
            <p style={styles.cardDesc}>{game.description}</p>
            {game.path !== '#' && (
              <button style={styles.button}>Start Assessment →</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Internal CSS-in-JS for Dashboard specific styles
const styles = {
  container: {
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    color: 'var(--info)',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-soft)',
    fontSize: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  card: {
    borderRadius: '16px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '1px solid var(--border-soft)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '200px',
  },
  cardTitle: {
    margin: '0 0 12px 0',
    fontSize: '1.25rem',
  },
  cardDesc: {
    color: 'var(--text-main)',
    lineHeight: '1.5',
    marginBottom: '20px',
  },
  button: {
    alignSelf: 'flex-start',
    padding: '10px 20px',
    borderRadius: '20px',
    border: 'none',
    background: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'var(--text-main)',
  }
};

export default Dashboard;