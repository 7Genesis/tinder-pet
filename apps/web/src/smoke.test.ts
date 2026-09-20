// Confirma que o Vitest está executando com jsdom.
describe('ambiente de teste', () => {
  it('executa com jsdom', () => {
    expect(document.createElement('div')).toBeInstanceOf(HTMLElement);
  });
});
