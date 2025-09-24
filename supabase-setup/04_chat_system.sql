-- ==========================================
-- CHAT SYSTEM TABLES
-- ==========================================
-- Additional tables for real-time chat functionality
-- Execute AFTER running the main database schema

-- ==========================================
-- CHATS TABLE
-- ==========================================

CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group', 'project')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar TEXT,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- ==========================================
-- CHAT PARTICIPANTS TABLE
-- ==========================================

CREATE TABLE public.chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    unread_count INTEGER DEFAULT 0,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(chat_id, user_id)
);

-- ==========================================
-- CHAT MESSAGES TABLE
-- ==========================================

CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'emoji', 'system')),
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    file_type VARCHAR(100),
    reactions JSONB DEFAULT '{}',
    reply_to UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
    edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- CHAT TYPING INDICATORS TABLE
-- ==========================================

CREATE TABLE public.chat_typing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(chat_id, user_id)
);

-- ==========================================
-- INDEXES FOR CHAT TABLES
-- ==========================================

-- Chats indexes
CREATE INDEX idx_chats_type ON public.chats(type);
CREATE INDEX idx_chats_project_id ON public.chats(project_id);
CREATE INDEX idx_chats_created_by ON public.chats(created_by);
CREATE INDEX idx_chats_last_activity ON public.chats(last_activity DESC);
CREATE INDEX idx_chats_is_active ON public.chats(is_active);

-- Chat participants indexes
CREATE INDEX idx_chat_participants_chat_id ON public.chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX idx_chat_participants_joined_at ON public.chat_participants(joined_at);
CREATE INDEX idx_chat_participants_active ON public.chat_participants(chat_id, user_id) WHERE left_at IS NULL;

-- Chat messages indexes
CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_reply_to ON public.chat_messages(reply_to);
CREATE INDEX idx_chat_messages_active ON public.chat_messages(chat_id, created_at DESC) WHERE deleted = false;

-- Chat typing indexes
CREATE INDEX idx_chat_typing_chat_id ON public.chat_typing(chat_id);
CREATE INDEX idx_chat_typing_started_at ON public.chat_typing(started_at);

-- ==========================================
-- TRIGGERS FOR CHAT TABLES
-- ==========================================

-- Update last_activity when new message is sent
CREATE OR REPLACE FUNCTION update_chat_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chats 
    SET last_activity = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.chat_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_last_activity
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_last_activity();

-- Update unread counts for participants
CREATE OR REPLACE FUNCTION update_unread_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment unread count for all participants except the sender
    UPDATE public.chat_participants 
    SET unread_count = unread_count + 1
    WHERE chat_id = NEW.chat_id 
    AND user_id != NEW.sender_id
    AND left_at IS NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_unread_counts
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_unread_counts();

-- Clean up old typing indicators (older than 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_old_typing()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.chat_typing 
    WHERE started_at < NOW() - INTERVAL '5 minutes';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_old_typing
    AFTER INSERT ON public.chat_typing
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_old_typing();

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chats_updated_at
    BEFORE UPDATE ON public.chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_chat_messages_updated_at
    BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- RLS POLICIES FOR CHAT TABLES
-- ==========================================

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_typing ENABLE ROW LEVEL SECURITY;

-- Chat policies
CREATE POLICY "Users can view chats they participate in" ON public.chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants 
            WHERE chat_id = chats.id 
            AND user_id::text = auth.uid()::text 
            AND left_at IS NULL
        )
    );

CREATE POLICY "Authenticated users can create chats" ON public.chats
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        created_by::text = auth.uid()::text
    );

CREATE POLICY "Chat creators and admins can update chats" ON public.chats
    FOR UPDATE USING (
        created_by::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM public.chat_participants 
            WHERE chat_id = chats.id 
            AND user_id::text = auth.uid()::text 
            AND role IN ('owner', 'admin')
            AND left_at IS NULL
        )
    );

-- Chat participants policies
CREATE POLICY "Users can view participants of their chats" ON public.chat_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants AS cp 
            WHERE cp.chat_id = chat_participants.chat_id 
            AND cp.user_id::text = auth.uid()::text 
            AND cp.left_at IS NULL
        )
    );

CREATE POLICY "Users can join chats" ON public.chat_participants
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        user_id::text = auth.uid()::text
    );

CREATE POLICY "Users can update their own participation" ON public.chat_participants
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can leave chats" ON public.chat_participants
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Chat messages policies
CREATE POLICY "Users can view messages in their chats" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants 
            WHERE chat_id = chat_messages.chat_id 
            AND user_id::text = auth.uid()::text 
            AND left_at IS NULL
        )
    );

CREATE POLICY "Chat participants can send messages" ON public.chat_messages
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        sender_id::text = auth.uid()::text AND
        EXISTS (
            SELECT 1 FROM public.chat_participants 
            WHERE chat_id = chat_messages.chat_id 
            AND user_id::text = auth.uid()::text 
            AND left_at IS NULL
        )
    );

CREATE POLICY "Users can update their own messages" ON public.chat_messages
    FOR UPDATE USING (sender_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own messages" ON public.chat_messages
    FOR DELETE USING (sender_id::text = auth.uid()::text);

-- Chat typing policies
CREATE POLICY "Users can view typing indicators in their chats" ON public.chat_typing
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants 
            WHERE chat_id = chat_typing.chat_id 
            AND user_id::text = auth.uid()::text 
            AND left_at IS NULL
        )
    );

CREATE POLICY "Chat participants can manage typing indicators" ON public.chat_typing
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        user_id::text = auth.uid()::text
    );

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to get user's chats with participant info
CREATE OR REPLACE FUNCTION get_user_chats(user_uuid UUID)
RETURNS TABLE (
    chat_id UUID,
    chat_type VARCHAR,
    chat_name VARCHAR,
    chat_description TEXT,
    chat_avatar TEXT,
    project_id UUID,
    created_by UUID,
    created_at TIMESTAMPTZ,
    last_activity TIMESTAMPTZ,
    is_active BOOLEAN,
    unread_count INTEGER,
    participant_count BIGINT,
    last_message_content TEXT,
    last_message_sender VARCHAR,
    last_message_time TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as chat_id,
        c.type as chat_type,
        c.name as chat_name,
        c.description as chat_description,
        c.avatar as chat_avatar,
        c.project_id,
        c.created_by,
        c.created_at,
        c.last_activity,
        c.is_active,
        COALESCE(cp.unread_count, 0) as unread_count,
        (SELECT COUNT(*) FROM public.chat_participants WHERE chat_id = c.id AND left_at IS NULL) as participant_count,
        lm.content as last_message_content,
        lu.full_name as last_message_sender,
        lm.created_at as last_message_time
    FROM public.chats c
    INNER JOIN public.chat_participants cp ON c.id = cp.chat_id
    LEFT JOIN LATERAL (
        SELECT content, sender_id, created_at
        FROM public.chat_messages
        WHERE chat_id = c.id AND deleted = false
        ORDER BY created_at DESC
        LIMIT 1
    ) lm ON true
    LEFT JOIN public.users lu ON lm.sender_id = lu.id
    WHERE cp.user_id = user_uuid 
    AND cp.left_at IS NULL
    AND c.is_active = true
    ORDER BY c.last_activity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark chat as read
CREATE OR REPLACE FUNCTION mark_chat_as_read(chat_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.chat_participants 
    SET unread_count = 0,
        last_read_at = NOW()
    WHERE chat_id = chat_uuid 
    AND user_id = user_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;