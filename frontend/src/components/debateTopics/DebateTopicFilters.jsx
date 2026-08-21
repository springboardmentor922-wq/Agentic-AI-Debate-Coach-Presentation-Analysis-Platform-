import "./DebateTopicFilters.css";

const DebateTopicFilters = ({
  searchTerm,
  onSearchChange,

  category,
  onCategoryChange,

  difficulty,
  onDifficultyChange,

  topicType,
  onTopicTypeChange,

  sortBy,
  onSortChange,
}) => {
  return (
    <div className="topic-filters-container">
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search debate topics..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Filters */}
      <div className="filters-row">

        {/* Category */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Education">Education</option>
          <option value="Environment">Environment</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Business">Business</option>
          <option value="Politics">Politics</option>
          <option value="Ethics">Ethics</option>
        </select>

        {/* Difficulty */}
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Difficulty</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        {/* Topic Type */}
        <select
          value={topicType}
          onChange={(e) => onTopicTypeChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Topics</option>
          <option value="official">Official Topics</option>
          <option value="custom">My Practice Topics</option>
          <option value="recommended">AI Recommended</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="filter-select"
        >
          <option value="latest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="az">A - Z</option>
          <option value="za">Z - A</option>
        </select>

      </div>
    </div>
  );
};

export default DebateTopicFilters;