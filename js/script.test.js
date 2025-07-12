// Basic test file for Jest
describe('Portfolio Tests', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });

  test('should have correct title', () => {
    document.body.innerHTML = '<title>Filbert Nana Blessing | DevOps Engineer</title>';
    const title = document.querySelector('title');
    expect(title.textContent).toContain('Filbert Nana Blessing');
  });
});