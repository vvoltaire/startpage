'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function PageHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      height: 60,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 76,
      flexShrink: 0,
      borderBottom: '1px solid rgba(107,139,209,0.12)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.82, filter: 'blur(10px)' }}
          animate={visible ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'rgba(55,85,170,0.88)',
          }}
        >
          Vinsline's
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={visible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.28 }}
          style={{
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'rgba(107,139,209,0.6)',
          }}
        >
          Start Page
        </motion.span>
      </div>
    </div>
  );
}
