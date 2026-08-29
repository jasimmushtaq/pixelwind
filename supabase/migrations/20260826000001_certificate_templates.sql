-- Certificate Templates Table
CREATE TABLE IF NOT EXISTS certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bg_image_url TEXT,
    bg_color TEXT,
    width INT NOT NULL DEFAULT 1056,
    height INT NOT NULL DEFAULT 816,
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_certificate_templates_updated_at BEFORE UPDATE ON certificate_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to ensure only one default template exists
CREATE OR REPLACE FUNCTION ensure_single_default_template()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE certificate_templates SET is_default = false WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_default_template
BEFORE INSERT OR UPDATE ON certificate_templates
FOR EACH ROW
EXECUTE PROCEDURE ensure_single_default_template();
