import { useContext, useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import moment from 'moment';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  CardProps,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import {
  DoneAllTwoTone,
  ExpandLessTwoTone,
  InsertComment,
  Share,
  ThumbUpAlt,
  RateReviewTwoTone,
  ThumbUpOffAlt
} from '@mui/icons-material';
import { GlobalContext } from './GlobalContext';
import { CommentType, LikeType, PostType } from '../util/types';
import { api } from '../util/api';
import {
  FacebookIcon,
  FacebookShareButton,
  RedditIcon,
  RedditShareButton,
  TwitterIcon,
  TwitterShareButton
} from 'react-share';
import Comments from './Comments';
import UserAvatar from './UserAvatar';

interface FeedPostProps extends CardProps {
  post: PostType;
}

export default function FeedPost({ post, ...rest }: FeedPostProps) {
  const { user } = useContext(GlobalContext);
  const client = useQueryClient();

  const userFullName = post.user.firstName.concat(' ', post.user.lastName);
  const [likes, setLikes] = useState<LikeType[]>();
  const [liked, setLiked] = useState<boolean>();
  const { isLoading: isLikeLoading, mutate: mutateLike } = useMutation(async () => {
    const response = await api.post(`/likes/${liked ? 'remove' : 'add'}`, null, {
      params: {
        postId: post.id
      }
    });

    await fetchLikes();
    return response;
  });

  const { isLoading: isLikesLoading, refetch: fetchLikes } = useQuery(
    ['fetchLikes', post.id],
    async ({ queryKey }) => {
      const [, postId] = queryKey;
      await api
        .get('/likes', {
          params: {
            postId: postId
          }
        })
        .then((response: AxiosResponse<LikeType[]>) => {
          const likesResponse = response.data;
          setLiked(() => likesResponse.some((like) => user?.id == like.user.id));
          setLikes(likesResponse);
        });
    },
    {
      retry: false,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  );

  const [comments, setComments] = useState<CommentType[]>();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { isLoading: isCommentsLoading, refetch: fetchComments } = useQuery(
    ['fetchComments', post.id],
    async ({ queryKey }) => {
      const [, postId] = queryKey;
      await api
        .get('/comments', {
          params: {
            postId: postId
          }
        })
        .then((response: AxiosResponse<CommentType[]>) => {
          setComments(response.data);
        });
    },
    {
      retry: false,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  );
  const postComment = () => {
    if (commentText) {
      api
        .post('/comments/add', null, {
          params: {
            text: commentText,
            postId: post.id
          }
        })
        .then(() => {
          setCommentText('');
          client.invalidateQueries('fetchComments');
        });
    }
  };

  const shareTitle = post.text ? `"${post.text}"` : `Check out this post on CC A1 by ${userFullName}.`;
  const shareUrl = `${window.location.href}/${post.id}`;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const shareOpen = Boolean(anchorEl);
  const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleShareClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [fetchLikes, fetchComments]);

  return (
    <>
      <Card {...rest} variant='outlined' sx={{ mt: '2rem' }}>
        <CardHeader
          avatar={<UserAvatar user={post.user} alt='Post User Image' />}
          title={userFullName}
          subheader={moment(post.createdAt).fromNow()}
          sx={{
            '.MuiCardHeader-title': {
              fontWeight: 'bold'
            }
          }}
        />
        {post.text && (
          <Link href={`/feed/${post.id}`} underline='none' color='inherit'>
            <CardContent>
              <Typography variant='body2'>{post.text}</Typography>
            </CardContent>
          </Link>
        )}
        {post.image && (
          <Link href={`/feed/${post.id}`}>
            <CardMedia
              component='img'
              sx={{
                backgroundColor: '#ffffff'
              }}
              image={post.image.url}
              alt='Post Image'
            />
          </Link>
        )}
        <CardActions disableSpacing sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          {isLikeLoading || isLikesLoading ? (
            <Button fullWidth disabled>
              {liked ? <ThumbUpAlt sx={{ pr: 1 }} color='primary' /> : <ThumbUpOffAlt sx={{ pr: 1 }} />}
              <CircularProgress size='1rem' color='primary' />
            </Button>
          ) : (
            <Button fullWidth onClick={() => mutateLike()}>
              {liked ? <ThumbUpAlt color='primary' /> : <ThumbUpOffAlt />}
              <Typography sx={{ width: '1rem', pl: 1 }}>{likes?.length}</Typography>
            </Button>
          )}
          {isCommentsLoading ? (
            <Button fullWidth disabled>
              <InsertComment sx={{ pr: 1 }} />
              <CircularProgress size='1rem' color='primary' />
            </Button>
          ) : (
            <Button fullWidth onClick={() => setCommentsOpen((prevState) => !prevState)}>
              {commentsOpen ? <ExpandLessTwoTone /> : <InsertComment />}
              <Typography sx={{ width: '1rem', pl: 1 }}>{comments?.length}</Typography>
            </Button>
          )}
          <Button fullWidth onClick={handleShareClick}>
            <Share />
          </Button>
          <Menu anchorEl={anchorEl} open={shareOpen} onClose={handleShareClose} disableScrollLock>
            <MenuItem onClick={handleShareClose}>
              <FacebookShareButton style={{ display: 'inline-flex' }} url={shareUrl} title={shareTitle}>
                <FacebookIcon size={32} round />
                <Typography sx={{ pl: 1 }}>Facebook</Typography>
              </FacebookShareButton>
            </MenuItem>
            <MenuItem onClick={handleShareClose}>
              <TwitterShareButton style={{ display: 'inline-flex' }} url={shareUrl} title={shareTitle}>
                <TwitterIcon size={32} round />
                <Typography sx={{ pl: 1 }}>Twitter</Typography>
              </TwitterShareButton>
            </MenuItem>
            <MenuItem onClick={handleShareClose}>
              <RedditShareButton style={{ display: 'inline-flex' }} url={shareUrl} title={shareTitle}>
                <RedditIcon size={32} round />
                <Typography sx={{ pl: 1 }}>Reddit</Typography>
              </RedditShareButton>
            </MenuItem>
          </Menu>
        </CardActions>
      </Card>
      <Collapse in={commentsOpen}>
        <Paper variant='outlined' style={{ border: '1px #e0e0e0 solid', borderTop: 0 }}>
          <Box display='flex' p={2} alignItems='center'>
            <Avatar sx={{ bgcolor: '#c4c4c4' }}>
              <RateReviewTwoTone />
            </Avatar>
            <TextField
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  postComment();
                }
              }}
              onChange={(event) => {
                setCommentText(event.target.value);
              }}
              variant='standard'
              fullWidth
              value={commentText}
              placeholder={comments?.length == 0 ? 'Be the first to comment.' : 'Write your comment.'}
              sx={{ pl: 2, pr: 1 }}
            />
            <IconButton onClick={() => postComment()}>
              <DoneAllTwoTone />
            </IconButton>
          </Box>
          {comments?.length != 0 && <Divider />}
          {isCommentsLoading ? <CircularProgress size={24} color='primary' /> : <Comments comments={comments} />}
        </Paper>
      </Collapse>
    </>
  );
}
