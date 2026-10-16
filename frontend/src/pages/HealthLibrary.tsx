import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, BookOpen, ChevronLeft, Clock3, Search } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

type ArticleCategory =
  | 'Nutrition'
  | 'Sleep'
  | 'Fitness'
  | 'Mental wellness'
  | 'Preventive care'
  | 'Chronic conditions';

interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  summary: string;
  readingTime: string;
  content: string[];
  sourceName: string;
  sourceUrl: string;
}

const articles: Article[] = [
  {
    id: 'balanced-meals',
    title: 'Building balanced meals, one choice at a time',
    category: 'Nutrition',
    summary: 'A practical starting point for adding variety and balance to everyday meals.',
    readingTime: '3 min read',
    content: [
      'A varied eating pattern can include vegetables and fruit, grains, and protein foods. Preferences, culture, budget, and health needs all shape what works for an individual.',
      'Small, flexible changes—such as adding a vegetable or choosing a whole-grain option—can be easier to maintain than strict rules. Nutrition needs differ, so people managing a health condition should follow advice from their care team.',
    ],
    sourceName: 'NHS: Eating a balanced diet',
    sourceUrl: 'https://www.nhs.uk/live-well/eat-well/how-to-eat-a-balanced-diet/',
  },
  {
    id: 'sleep-routine',
    title: 'Creating a steadier sleep routine',
    category: 'Sleep',
    summary: 'Understand healthy sleep habits and when persistent sleep problems deserve attention.',
    readingTime: '3 min read',
    content: [
      'A regular wind-down routine and a sleep environment that feels comfortable may support better rest. Sleep needs vary by age and person; a single target does not fit everyone.',
      'Ongoing difficulty sleeping, daytime impairment, or concerns such as loud snoring are reasons to discuss sleep with a qualified health professional. This guide cannot identify or treat a sleep disorder.',
    ],
    sourceName: 'CDC: About Sleep',
    sourceUrl: 'https://www.cdc.gov/sleep/about/index.html',
  },
  {
    id: 'move-more',
    title: 'Finding movement that fits your day',
    category: 'Fitness',
    summary: 'Explore ways to make regular physical activity more approachable and sustainable.',
    readingTime: '3 min read',
    content: [
      'Movement can take many forms, including walking, cycling, household activity, and sports. The World Health Organization describes physical activity as movement produced by skeletal muscles that requires energy.',
      'Choose activities that feel appropriate and accessible to you. If you have a health condition, symptoms, or questions about safe activity, ask a qualified health professional for individual guidance.',
    ],
    sourceName: 'WHO: Physical activity',
    sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
  },
  {
    id: 'mental-wellness',
    title: 'Everyday ways to care for mental well-being',
    category: 'Mental wellness',
    summary: 'A gentle overview of self-care practices and how to seek support.',
    readingTime: '3 min read',
    content: [
      'Self-care can include making time for rest, connection, and activities that matter to you. What helps is personal, and it is okay if one strategy does not suit everyone.',
      'If stress or emotional distress is affecting daily life, consider speaking with a qualified mental health professional. If you or someone else is in immediate danger, contact local emergency services.',
    ],
    sourceName: 'NIMH: Caring for Your Mental Health',
    sourceUrl: 'https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health',
  },
  {
    id: 'preventive-visits',
    title: 'Getting more from a preventive health visit',
    category: 'Preventive care',
    summary: 'Simple ways to prepare questions and share relevant health history with a clinician.',
    readingTime: '2 min read',
    content: [
      'Before a visit, it may help to note questions, current medicines, allergies, and changes you have noticed. Bring information that is relevant to the reason for your visit.',
      'Recommended screening and preventive care depend on personal factors and local guidance. A clinician can help you understand which options apply to you; this article does not replace that conversation.',
    ],
    sourceName: 'CDC: Prevention',
    sourceUrl: 'https://www.cdc.gov/prevention/',
  },
  {
    id: 'living-with-diabetes',
    title: 'Learning the basics of diabetes care',
    category: 'Chronic conditions',
    summary: 'An introductory guide to understanding diabetes information from a trusted public-health source.',
    readingTime: '3 min read',
    content: [
      'Diabetes is a group of conditions that affect how the body uses blood glucose. There are different types, and care is tailored to the person and their circumstances.',
      'For questions about diagnosis, medicines, monitoring, food, or activity, use a qualified care professional and trusted health information. Do not start, stop, or change treatment based on a general article.',
    ],
    sourceName: 'NIDDK: Diabetes Overview',
    sourceUrl: 'https://www.niddk.nih.gov/health-information/diabetes/overview',
  },
];

const categories: Array<'All topics' | ArticleCategory> = [
  'All topics',
  'Nutrition',
  'Sleep',
  'Fitness',
  'Mental wellness',
  'Preventive care',
  'Chronic conditions',
];
const bookmarkKey = 'sehatsync-health-library-bookmarks';

export const HealthLibrary: React.FC = () => {
  const { articleId } = useParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All topics' | ArticleCategory>('All topics');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [bookmarkError, setBookmarkError] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(bookmarkKey);
      setSavedIds(saved ? JSON.parse(saved) as string[] : []);
    } catch {
      setBookmarkError(true);
    }
  }, []);

  const filteredArticles = useMemo(
    () =>
      articles.filter((article) => {
        const matchesSearch = `${article.title} ${article.summary} ${article.category}`
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        return (
          matchesSearch &&
          (category === 'All topics' || article.category === category) &&
          (!savedOnly || savedIds.includes(article.id))
        );
      }),
    [search, category, savedOnly, savedIds],
  );

  const selectedArticle = articles.find((article) => article.id === articleId);

  const toggleBookmark = (id: string) => {
    const updated = savedIds.includes(id)
      ? savedIds.filter((savedId) => savedId !== id)
      : [...savedIds, id];
    try {
      localStorage.setItem(bookmarkKey, JSON.stringify(updated));
      setSavedIds(updated);
      setBookmarkError(false);
    } catch {
      setBookmarkError(true);
    }
  };

  if (articleId) {
    if (!selectedArticle) {
      return (
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">Article not found</h1>
          <Link to="/library" className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:underline">Return to Health Library</Link>
        </div>
      );
    }

    const isSaved = savedIds.includes(selectedArticle.id);
    return (
      <article className="mx-auto max-w-3xl space-y-6">
        <Link to="/library" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-800 hover:underline">
          <ChevronLeft className="h-4 w-4" /> Health Library
        </Link>
        <header className="rounded-3xl bg-gradient-to-br from-teal-800 to-emerald-700 p-6 text-white sm:p-9">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{selectedArticle.category}</span>
          <h1 className="mt-4 text-3xl font-bold leading-tight">{selectedArticle.title}</h1>
          <p className="mt-3 text-sm text-teal-50">{selectedArticle.readingTime} · Educational overview</p>
          <button type="button" onClick={() => toggleBookmark(selectedArticle.id)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/40 px-3 py-2 text-sm font-semibold hover:bg-white/10">
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {isSaved ? 'Saved' : 'Save article'}
          </button>
        </header>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="mb-6 border-l-4 border-amber-400 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Health Library content is for general education. It is not a diagnosis or a substitute for personalized advice from a qualified health professional.
          </p>
          <div className="space-y-5 text-base leading-8 text-slate-700">
            {selectedArticle.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <aside className="mt-8 border-t border-slate-100 pt-5">
            <h2 className="text-sm font-semibold text-slate-900">Further reading</h2>
            <a href={selectedArticle.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-teal-800 underline decoration-teal-300 underline-offset-2">
              {selectedArticle.sourceName}
            </a>
            <p className="mt-2 text-xs text-slate-500">Source material is provided by the organization linked above. Article author or medical reviewer information has not been provided.</p>
          </aside>
        </div>
        {bookmarkError && <p role="alert" className="text-sm text-rose-700">Bookmarks could not be saved in this browser.</p>}
      </article>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-3xl bg-gradient-to-br from-teal-800 to-emerald-700 p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-teal-100"><BookOpen className="h-4 w-4" /> Learn at your pace</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Health Library</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50">Clear, general health education with links to trusted public-health sources.</p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block">
            <span className="sr-only">Search health articles</span>
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles or topics" className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </label>
          <button type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${savedOnly ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
            <BookmarkCheck className="h-4 w-4" /> Saved articles
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Article categories">
          {categories.map((item) => (
            <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${category === item ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-800'}`}>
              {item}
            </button>
          ))}
        </div>
      </section>

      {bookmarkError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">Bookmarks could not be saved in this browser. You can still read the articles.</p>}

      {filteredArticles.length ? (
        <section aria-label="Health articles" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <article key={article.id} className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-800">{article.category}</span>
                <button type="button" aria-label={savedIds.includes(article.id) ? `Remove ${article.title} from saved articles` : `Save ${article.title}`} onClick={() => toggleBookmark(article.id)} className="rounded-lg p-2 text-teal-800 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-600">
                  {savedIds.includes(article.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </button>
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-900">{article.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{article.summary}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" />{article.readingTime}</span>
                <Link to={`/library/${article.id}`} className="text-sm font-semibold text-teal-800 hover:underline">Read article</Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-teal-700" />
          <h2 className="mt-3 font-semibold text-slate-900">No articles match these filters</h2>
          <p className="mt-1 text-sm text-slate-600">Try a different topic or search phrase.</p>
        </div>
      )}
    </div>
  );
};

export default HealthLibrary;
