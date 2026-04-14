import { renderHook, waitFor } from '@testing-library/react';
import { useJsonData } from '../utils/useJsonData';

vi.mock('../utils/jsonLoader', () => ({
  jsonLoader: vi.fn(),
}));

import { jsonLoader } from '../utils/jsonLoader';

describe('useJsonData', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts in loading state', () => {
    jsonLoader.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useJsonData('test.json'));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('resolves to data on success', async () => {
    const mockData = { foo: 'bar' };
    jsonLoader.mockResolvedValue(mockData);
    const { result } = renderHook(() => useJsonData('test.json'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('sets error state on failure', async () => {
    const err = new Error('load failed');
    jsonLoader.mockRejectedValue(err);
    const { result } = renderHook(() => useJsonData('test.json'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(err);
  });

  it('returns loading:false immediately when file is null', () => {
    const { result } = renderHook(() => useJsonData(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
