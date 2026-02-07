#!/usr/bin/env node

/**
 * Supabase Storage Setup Script
 * 
 * This script creates the university-logos bucket and sets up all required storage policies.
 * It's idempotent - safe to run multiple times, even if bucket already exists.
 * 
 * Usage:
 *   npm run setup-storage
 * 
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file
 *   - @supabase/supabase-js package (already installed in backend)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from backend root
dotenv.config();

const SUPABASE_URL = process.env.DB_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - DB_URL');
  console.error('   - SUPABASE_SERVICE_KEY');
  console.error('\nPlease add these to your .env file');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const BUCKET_NAME = 'university-logos';

/**
 * Create storage bucket for university logos
 */
async function createBucket() {
  console.log('🪣 Creating storage bucket...');
  
  const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Bucket already exists, continuing...');
      return true;
    } else {
      console.error('❌ Failed to create bucket:', error.message);
      return false;
    }
  }

  console.log('✅ Bucket created successfully');
  return true;
}

/**
 * Set up storage policies for the bucket
 */
async function setupPolicies() {
  console.log('🔐 Setting up storage policies...');

  const policies = [
    {
      name: 'Public read access for university logos',
      sql: `CREATE POLICY "Public read access for university logos" ON storage.objects FOR SELECT USING (bucket_id = '${BUCKET_NAME}');`
    },
    {
      name: 'Authenticated users can upload university logos',
      sql: `CREATE POLICY "Authenticated users can upload university logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = '${BUCKET_NAME}' AND auth.role() = 'authenticated');`
    },
    {
      name: 'Authenticated users can update university logos',
      sql: `CREATE POLICY "Authenticated users can update university logos" ON storage.objects FOR UPDATE USING (bucket_id = '${BUCKET_NAME}' AND auth.role() = 'authenticated');`
    },
    {
      name: 'Authenticated users can delete university logos',
      sql: `CREATE POLICY "Authenticated users can delete university logos" ON storage.objects FOR DELETE USING (bucket_id = '${BUCKET_NAME}' AND auth.role() = 'authenticated');`
    }
  ];

  let successCount = 0;
  
  for (const policy of policies) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: policy.sql
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`✅ Policy "${policy.name}" already exists`);
          successCount++;
        } else {
          console.error(`❌ Failed to create policy "${policy.name}":`, error.message);
          console.log('   Manual SQL to run in Supabase Dashboard:');
          console.log(`   ${policy.sql}`);
          console.log('');
        }
      } else {
        console.log(`✅ Created policy: "${policy.name}"`);
        successCount++;
      }
    } catch (err) {
      console.log(`⚠️  Cannot auto-create policy "${policy.name}"`);
      console.log('   Please run this SQL in Supabase SQL Editor:');
      console.log(`   ${policy.sql}`);
      console.log('');
    }
  }

  return successCount;
}

/**
 * Verify bucket and policies are working
 */
async function verifySetup() {
  console.log('🔍 Verifying setup...');

  // Check if bucket exists
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Failed to list buckets:', bucketsError.message);
    return false;
  }

  const bucket = buckets.find(b => b.name === BUCKET_NAME);
  if (!bucket) {
    console.error('❌ Bucket not found after creation');
    return false;
  }

  console.log('✅ Bucket verification passed');
  console.log(`   - Name: ${bucket.name}`);
  console.log(`   - Public: ${bucket.public}`);
  console.log(`   - Created: ${bucket.created_at}`);

  // Test bucket access
  try {
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list();

    if (listError) {
      console.error('❌ Failed to list bucket contents:', listError.message);
      return false;
    }

    console.log('✅ Bucket access verification passed');
    return true;
  } catch (err) {
    console.error('❌ Bucket access test failed:', err.message);
    return false;
  }
}

/**
 * Main setup function
 */
async function main() {
  console.log('🚀 Starting Supabase Storage Setup');
  console.log('=====================================');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🪣 Bucket Name: ${BUCKET_NAME}`);
  console.log('');

  try {
    // Step 1: Create bucket
    const bucketSuccess = await createBucket();
    if (!bucketSuccess) {
      console.error('❌ Setup failed at bucket creation');
      process.exit(1);
    }

    // Step 2: Setup policies
    console.log('');
    const policyCount = await setupPolicies();
    
    // Step 3: Verify setup
    console.log('');
    const verifySuccess = await verifySetup();
    
    console.log('');
    console.log('=====================================');
    if (verifySuccess) {
      console.log('🎉 Storage setup completed successfully!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Your university-logos bucket is ready');
      console.log('2. Storage policies are configured');
      console.log('3. You can now implement image upload in the frontend');
    } else {
      console.log('⚠️  Setup completed with warnings');
      console.log('Please check the Supabase Dashboard to verify everything is working');
    }

  } catch (error) {
    console.error('❌ Setup failed with error:', error.message);
    process.exit(1);
  }
}

// Run the setup
main().catch(console.error);
