import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VisitStats from '@/components/VisitStats';

// Minimal fetch Response stub good enough for the component, which only reads
// `response.ok` and `response.json()`.
const okJson = (body: unknown) => ({ ok: true, json: async () => body });

// Matches the fields VisitStats reads. `total_visits` uses a 4-digit value so
// the `toLocaleString()` thousands separator ("1,234") is exercised.
const statsFixture = {
  total_visits: 1234,
  unique_visitors: 567,
  recent_visits: 42,
  top_referrers: [{ referrer: 'https://google.com', count: 10 }],
  visits_by_page: [],
};

describe('VisitStats', () => {
  let debugSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    global.fetch = jest.fn();
    // The component logs unreachable-backend failures at debug level (and React
    // may surface stray errors); keep the test output clean.
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Undo the 30s refresh interval's timer backend if a test opted into fakes,
    // and restore the console spies.
    jest.useRealTimers();
    jest.restoreAllMocks();
    void debugSpy;
    void errorSpy;
  });

  it('shows the loading skeleton before the fetch resolves', async () => {
    // Both the track POST and the stats GET resolve to the fixture.
    (global.fetch as jest.Mock).mockResolvedValue(okJson(statsFixture));

    const { container } = render(<VisitStats />);

    // Synchronously after mount the fetch promises are still pending, so the
    // animated skeleton renders and no real stats are shown yet.
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(screen.queryByText('Live Stats')).not.toBeInTheDocument();

    // Flush the post-fetch state update so the test leaves no pending work
    // (avoids act() warnings).
    await screen.findByText('Live Stats');
  });

  it('renders the stats once the fetch resolves', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(okJson(statsFixture));

    render(<VisitStats />);

    // Waiting on the label proves we transitioned out of the loading branch.
    expect(await screen.findByText('Live Stats')).toBeInTheDocument();

    // Numeric values are rendered via toLocaleString().
    expect(screen.getByText('1,234')).toBeInTheDocument(); // total_visits
    expect(screen.getByText('567')).toBeInTheDocument(); // unique_visitors
    expect(screen.getByText('42')).toBeInTheDocument(); // recent_visits (Last 24h)

    // Top referrer is shown as its URL hostname.
    expect(screen.getByText('google.com')).toBeInTheDocument();
  });

  it('renders nothing when the fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

    const { container } = render(<VisitStats />);

    // On error the component sets loading=false and returns null, so the
    // container ends up empty.
    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(screen.queryByText('Live Stats')).not.toBeInTheDocument();
  });

  it('is hidden on small screens (hidden lg:block on the root)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(okJson(statsFixture));

    const { container } = render(<VisitStats />);

    await screen.findByText('Live Stats');
    expect(container.firstChild).toHaveClass('hidden', 'lg:block');
  });
});
