import { useState } from "react";
import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/RateLimitedUI";
import { useEffect } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import NoteCard from "../components/NoteCard";
import NotesNotFound from "../components/NotesNotFound";

const HomePage = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes");
        console.log(res.data);
        setNotes(res.data);
        setIsRateLimited(false);
          setHasError(false);
      } catch (error) {
        console.log("Error fetching notes");
        console.log(error.response);
        const status = error.response?.status;
        if (status === 429) {
          setIsRateLimited(true);
        } else if (status >= 400 && status < 600) {
          // show a friendly error UI instead of a blank page
          setHasError(true);
          toast.error("Something went wrong while loading notes");
        } else {
          // network or unknown error
          setHasError(true);
          toast.error("Network error: Failed to load notes");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {isRateLimited && <RateLimitedUI />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && <div className="text-center text-primary py-10">Loading notes...</div>}

        {hasError && (
          <div className="text-center py-10">
            <h3 className="text-xl font-bold mb-4">Something went wrong</h3>
            <p className="mb-4 text-base-content/70">We couldn't load your notes. Please try again.</p>
            <div className="flex items-center justify-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setLoading(true);
                  setHasError(false);
                  // re-trigger effect by calling fetch inline
                  (async () => {
                    try {
                      const res = await api.get("/notes");
                      setNotes(res.data);
                    } catch (e) {
                      toast.error("Retry failed");
                    } finally {
                      setLoading(false);
                    }
                  })();
                }}
              >
                Retry
              </button>
              <a href="/" className="btn btn-ghost">
                Go Home
              </a>
            </div>
          </div>
        )}

        {!hasError && notes.length === 0 && !isRateLimited && <NotesNotFound />}

        {!hasError && notes.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} setNotes={setNotes} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default HomePage;
