# Database Schema

## users

Stores account and role information.

- `id`: primary key
- `name`: display name
- `email`: unique login email
- `password_hash`: salted password hash
- `role`: learner, coach, educator, or admin
- `created_at`: account creation timestamp

## profiles

Stores user coaching preferences.

- `user_id`: primary key and foreign key to users
- `experience_level`
- `preferred_topics`
- `presentation_domains`
- `learning_goals`
- `coaching_preferences`

## skills

Stores measurable debate and presentation skill values.

- `user_id`: owner
- `skill_name`: tracked skill
- `score`: 0 to 100
- `updated_at`

## debate_sessions

Stores debate planning and status.

- `id`: primary key
- `owner_id`: user who created the session
- `topic`
- `format`
- `position`
- `opponent_type`
- `scheduled_for`
- `status`: scheduled, active, completed, or cancelled
- `notes`
- `created_at`

