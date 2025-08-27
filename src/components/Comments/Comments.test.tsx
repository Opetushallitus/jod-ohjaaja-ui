import { addArtikkelinKommentti, deleteArtikkelinKommentti, getArtikkelinKommentit } from '@/api/artikkelinKommentit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Comments from './Comments';

// Mock the API functions
vi.mock('@/api/artikkelinKommentit', () => ({
  getArtikkelinKommentit: vi.fn(),
  addArtikkelinKommentti: vi.fn(),
  deleteArtikkelinKommentti: vi.fn(),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Comments', () => {
  const mockComments = {
    sisalto: [
      {
        id: '1',
        ohjaajaId: 'user1',
        kommentti: 'Test comment 1',
        luotu: '2023-01-01T00:00:00Z',
      },
      {
        id: '2',
        ohjaajaId: 'user2',
        kommentti: 'Test comment 2',
        luotu: '2023-01-02T00:00:00Z',
      },
    ],
    maara: 1,
    sivuja: 1,
  };

  beforeEach(() => {
    (getArtikkelinKommentit as Mock).mockResolvedValue(mockComments);
  });

  it('should render comments list', async () => {
    render(<Comments articleErc={'1'} userId="user1" />);

    await waitFor(() => {
      expect(screen.getByText('Test comment 1')).toBeInTheDocument();
      expect(screen.getByText('Test comment 2')).toBeInTheDocument();
    });
  });

  it('should show no comments message when empty', async () => {
    (getArtikkelinKommentit as Mock).mockResolvedValue({ sisalto: [], sivuja: 0 });

    render(<Comments articleErc={'1'} userId="user1" />);

    await waitFor(() => {
      expect(screen.getByText('comments.noComments')).toBeInTheDocument();
    });
  });

  it('should add new comment', async () => {
    HTMLDivElement.prototype.scrollTo = vi.fn();
    render(<Comments articleErc={'1'} userId="user1" />);

    const input = screen.getByPlaceholderText('comments.comment.placeholder');
    fireEvent.change(input, { target: { value: 'New comment' } });

    const submitButton = screen.getByRole('button', { name: 'comments.comment.send' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(addArtikkelinKommentti).toHaveBeenCalledWith('1', 'New comment');
    });
    expect(HTMLDivElement.prototype.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('should delete comment', async () => {
    render(<Comments articleErc={'1'} userId="user1" />);
    const user = userEvent.setup();
    await waitFor(async () => {
      await user.click(screen.getAllByLabelText('comments.comment.delete.label')[0]);
      await user.click(screen.getByText('comments.comment.delete.confirmText'));
    });

    expect(deleteArtikkelinKommentti).toHaveBeenCalledWith('1');
  });

  it('should not show comment input when userId is not provided', async () => {
    render(<Comments articleErc={'1'} />);
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('comments.comment.placeholder')).not.toBeInTheDocument();
    });
  });
});
