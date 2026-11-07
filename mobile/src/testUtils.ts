import renderer from 'react-test-renderer';

export function textFromTree(node: renderer.ReactTestRendererJSON | renderer.ReactTestRendererJSON[] | null): string {
  if (!node) {
    return '';
  }

  if (Array.isArray(node)) {
    return node.map(textFromTree).join(' ');
  }

  const ownText = (node.children ?? []).filter((child): child is string => typeof child === 'string').join(' ');
  const childText = (node.children ?? [])
    .filter((child): child is renderer.ReactTestRendererJSON => typeof child !== 'string')
    .map(textFromTree)
    .join(' ');

  return `${ownText} ${childText}`.trim();
}
