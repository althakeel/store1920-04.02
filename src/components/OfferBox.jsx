import React from 'react';

const OfferBox = () => {
  const barStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'stretch',
    background: '#066A3F',
    borderRadius: '4px',
    overflow: 'hidden',
    minHeight: '30px',
    boxSizing: 'border-box',
  };

  const badgeWrapStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px 0 14px',
    background: '#F0CD6A',
    flexShrink: 0,
  };

  const badgeEdgeStyle = {
    position: 'absolute',
    top: 0,
    right: '-10px',
    width: '16px',
    height: '100%',
    background: '#F0CD6A',
    transform: 'skewX(-20deg)',
  };

  const badgeTextStyle = {
    position: 'relative',
    zIndex: 1,
    color: '#075739',
    fontSize: '14px',
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    fontFamily: 'Arial, sans-serif',
  };

  const rightStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 12px 0 14px',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flex: 1,
    minWidth: 0,
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  };

  const checkStyle = {
    fontSize: '12px',
    lineHeight: 1,
    fontWeight: 700,
  };

  const dividerStyle = {
    color: '#D9EEE3',
    fontSize: '13px',
    lineHeight: 1,
    fontWeight: 600,
    margin: '0 1px',
  };

  return (
    <div style={barStyle} role="note" aria-label="Season saving offers">
      <div style={badgeWrapStyle}>
        <div style={badgeEdgeStyle} />
        <span style={badgeTextStyle}>SEASON SAVING</span>
      </div>

      <div style={rightStyle}>
        <div style={itemStyle}>
          <span style={checkStyle}>✓</span>
          <span>Free shipping</span>
        </div>

        <span style={dividerStyle} aria-hidden="true">|</span>

        <div style={itemStyle}>
          <span style={checkStyle}>✓</span>
          <span>AED20.00 Credit for delay</span>
        </div>
      </div>
    </div>
  );
};

export default OfferBox;
