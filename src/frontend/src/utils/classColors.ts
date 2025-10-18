// WoW Class Colors - Standard colors used in the game
export const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41F3B',
  'Demon Hunter': '#A330C9',
  'Druid': '#FF7D0A',
  'Evoker': '#228B22',
  'Hunter': '#ABD473',
  'Mage': '#69CCF0',
  'Monk': '#33937F',
  'Paladin': '#F58CBA',
  'Priest': '#FFFFFF',
  'Rogue': '#FFF569',
  'Shaman': '#0070DE',
  'Warlock': '#9482C9',
  'Warrior': '#C79C6E'
}

export const getClassColor = (className: string): string => {
  return CLASS_COLORS[className] || '#6B7280' // Default gray if class not found
}

export const getClassTextColor = (className: string): string => {
  // For classes with light backgrounds, use dark text
  const lightClasses = ['Priest', 'Rogue', 'Monk']
  return lightClasses.includes(className) ? '#1F2937' : '#FFFFFF'
}
