import React, { useState, useEffect, useMemo } from 'react';
import '../../assets/styles/ProductVariants.css';

export default function ProductVariants({ variations, selectedVariation, onVariationChange }) {
  const isCompactAttribute = (name = '') => {
    const normalized = String(name).toLowerCase();
    return /(size|height|width|length|qty|quantity|capacity|pack|set)/.test(normalized);
  };

  // Get unique attribute names from all variations
  const attributeNames = useMemo(() => {
    if (!variations || variations.length === 0) return [];
    const namesSet = new Set();
    variations.forEach(v => {
      v.attributes?.forEach(attr => {
        if (attr.name) namesSet.add(attr.name);
      });
    });
    return Array.from(namesSet);
  }, [variations]);

  // Build a map from attribute name to unique options
  const attributeOptions = useMemo(() => {
    const map = {};
    attributeNames.forEach(name => {
      const optionsSet = new Set();
      variations.forEach(v => {
        v.attributes?.forEach(attr => {
          if (attr.name === name && attr.option) optionsSet.add(attr.option);
        });
      });
      map[name] = Array.from(optionsSet);
    });
    return map;
  }, [variations, attributeNames]);

  // State for selected options (e.g. { Color: 'Red', Size: 'M' })
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const init = {};
    attributeNames.forEach(name => {
      const selectedAttr = selectedVariation?.attributes?.find(a => a.name === name);
      init[name] = selectedAttr?.option || '';
    });
    return init;
  });

  // Sync selectedOptions state if selectedVariation changes externally
  useEffect(() => {
    const init = {};
    attributeNames.forEach(name => {
      const selectedAttr = selectedVariation?.attributes?.find(a => a.name === name);
      init[name] = selectedAttr?.option || '';
    });
    setSelectedOptions(init);
  }, [selectedVariation, attributeNames]);

  // Find matching variation whenever selectedOptions change and notify parent
  useEffect(() => {
    if (!variations || variations.length === 0) return;

    const allAttributesChosen = attributeNames.every(name => Boolean(selectedOptions[name]));

    if (!allAttributesChosen) {
      if (selectedVariation) onVariationChange(null);
      return;
    }

    const matchingVariation = variations.find(variation =>
      attributeNames.every(name => {
        const attr = variation.attributes?.find(a => a.name === name);
        return attr?.option === selectedOptions[name];
      })
    );

    if (matchingVariation && matchingVariation.id !== selectedVariation?.id) {
      onVariationChange(matchingVariation);
    }
    if (!matchingVariation && selectedVariation) {
      onVariationChange(null);
    }
  }, [selectedOptions, variations, attributeNames, onVariationChange, selectedVariation]);

  if (!variations || variations.length === 0) return null;

  return (
    <div className="variants-section">
      {attributeNames.map(name => (
        <div key={name} className="variant-attribute-group">
          {(() => {
            const compactAttribute = isCompactAttribute(name);

            return (
              <>
          <div className="variant-title">
            <span className="variant-title-name">{name}</span>
            {!!selectedOptions[name] && (
              <span className="variant-title-selected">: {selectedOptions[name]}</span>
            )}
          </div>
          <div className={`variants-list ${compactAttribute ? 'variants-list--pill' : 'variants-list--card'}`}>
            {attributeOptions[name].map(option => {
              const optionVariations = variations.filter(v =>
                v.attributes?.some(attr => attr.name === name && attr.option === option)
              );
              const optionImage = optionVariations[0]?.image?.src || '';
              const compactOption = compactAttribute;

              const isOutOfStock = optionVariations.every(v => v.is_in_stock === false);
              const isSelected = selectedOptions[name] === option;

              return (
                <button
                key={option}
                className={`variant-btn ${compactOption ? 'variant-btn--pill' : ''} ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                type="button"
                disabled={isOutOfStock}
                aria-pressed={isSelected}
                onClick={() => {
                  if (!isOutOfStock) {
                    setSelectedOptions(prev => ({ ...prev, [name]: option }));
                  }
                }}
              >
                {!compactOption && (
                  <div className="variant-image-wrapper">
                    {optionImage && (
                    <img
                      src={optionImage}
                      alt={`${name} ${option}`}
                      className="variant-image"
                      loading="lazy"
                    />
                    )}
                    {isOutOfStock && <div className="variant-overlay">Out of Stock</div>}
                  </div>
                )}
                <span className="variant-label">{option}</span>
              </button>
              
              );
            })}
          </div>
              </>
            );
          })()}
        </div>
      ))}
    </div>
  );
}
